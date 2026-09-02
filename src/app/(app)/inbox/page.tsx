'use client';

import { useState } from 'react';

import { CaptureComposer } from '@/components/capture/capture-composer';
import { CaptureItem } from '@/components/capture/capture-item';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useListCapturesQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';

type Tab = 'open' | 'archived';

export default function InboxPage() {
  const [tab, setTab] = useState<Tab>('open');
  const { data: items, isLoading } = useListCapturesQuery(tab);
  const { data: open } = useListCapturesQuery('open');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Inbox"
        subtitle={open ? `${open.length} to sort` : undefined}
        actions={
          <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
            {(['open', 'archived'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-[12px] capitalize transition-colors',
                  tab === t
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="reading-column flex-1 px-4 py-6 sm:px-6">
        {tab === 'open' ? (
          <div className="border-hairline bg-surface mb-6 rounded-2xl border p-4">
            <CaptureComposer autoFocus minHeight="7.5rem" />
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonRows rows={4} />
        ) : !items || items.length === 0 ? (
          <EmptyState
            title={tab === 'open' ? 'Inbox zero' : 'Nothing archived'}
            description={
              tab === 'open'
                ? 'Anything on your mind goes here first — no title, no tags, no plan. Sort it into a task or a thought whenever you like.'
                : 'Things you archive, or turn into a task or thought, land here.'
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((c) => (
              <CaptureItem key={c.id} capture={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
