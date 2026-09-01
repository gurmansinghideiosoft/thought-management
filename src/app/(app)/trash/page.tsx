'use client';

import { formatDistanceToNow } from 'date-fns';
import { RotateCcw, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useListTrashQuery, useRestoreThoughtMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

export default function TrashPage() {
  const { data, isLoading } = useListTrashQuery();
  const [restore, { isLoading: restoring }] = useRestoreThoughtMutation();
  const toast = useToast();

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Trash"
        subtitle="Deleted thoughts. Restoring brings back their entries too."
      />
      <div className="content-column flex-1 px-4 py-5 sm:px-6">
        {isLoading ? (
          <SkeletonRows rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Trash2 size={22} />}
            title="Trash is empty"
            description="Deleted thoughts show up here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((t) => (
              <div
                key={t.id}
                className="border-hairline bg-surface flex items-center gap-3 rounded-xl border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate font-medium">{t.title}</p>
                  <p className="text-ink-faint text-[12px]">
                    {t.entryCount} entries · deleted{' '}
                    {t.deletedAt
                      ? formatDistanceToNow(new Date(t.deletedAt), { addSuffix: true })
                      : 'recently'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={restoring}
                  onClick={async () => {
                    try {
                      await restore(t.id).unwrap();
                      toast.success('Thought restored');
                    } catch (err) {
                      toast.error(errorMessage(err, 'Could not restore'));
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
