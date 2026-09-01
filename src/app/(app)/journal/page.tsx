'use client';

import { NotebookPen, PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BannerBar } from '@/components/banners/banner-bar';
import { PageHeader } from '@/components/layout/page-header';
import { JournalCard } from '@/components/journal/journal-card';
import { JournalListItem } from '@/components/journal/journal-list-item';
import { Button } from '@/components/ui/button';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useListJournalInfiniteQuery,
  useMeQuery,
  useUpdateMeMutation,
  useUpsertJournalByDateMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { toDateKey } from '@/lib/date';

export default function JournalPage() {
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const [upsert] = useUpsertJournalByDateMutation();
  const { data: me } = useMeQuery();
  const [updateMe] = useUpdateMeMutation();

  const setBanner = async (journalBanner: string | null) => {
    try {
      await updateMe({ journalBanner }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change the background'));
    }
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useListJournalInfiniteQuery();

  const entries = data ? data.pages.flatMap((p) => p.items) : [];
  const featured = entries.slice(0, 3);
  const rest = entries.slice(3);

  const writeToday = async () => {
    setStarting(true);
    try {
      const entry = await upsert({ date: toDateKey(new Date()) }).unwrap();
      router.push(`/journal/${entry.id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not open today’s journal'));
      setStarting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Journal"
        actions={
          <Button size="sm" loading={starting} onClick={writeToday}>
            <PenLine size={15} />
            Write today
          </Button>
        }
      />

      <BannerBar
        value={me?.user.journalBanner ?? null}
        onChange={setBanner}
        className="h-[22vh] max-h-[260px] min-h-[140px]"
      >
        <p className="font-serif text-lg font-medium text-white drop-shadow sm:text-xl">
          End the day by writing it down.
        </p>
      </BannerBar>

      <div className="content-column flex-1 px-4 py-6 sm:px-6">
        {isLoading ? (
          <CenteredSpinner />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={22} />}
            title="No entries yet"
            description="End the day by writing it down."
            action={
              <Button size="sm" onClick={writeToday} loading={starting}>
                <PenLine size={15} />
                Write today
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((entry) => (
                <JournalCard key={entry.id} entry={entry} />
              ))}
            </div>

            {rest.length > 0 ? (
              <div className="mt-8">
                <div className="text-ink-faint mb-1 px-3 text-[12px] font-medium tracking-wide uppercase">
                  Earlier
                </div>
                <div className="flex flex-col">
                  {rest.map((entry) => (
                    <JournalListItem key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ) : null}

            {hasNextPage ? (
              <div className="mt-4 text-center">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  Load older
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
