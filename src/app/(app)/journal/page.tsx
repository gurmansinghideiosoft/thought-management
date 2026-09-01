'use client';

import { format } from 'date-fns';
import { NotebookPen, PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { JournalCalendar } from '@/components/journal/journal-calendar';
import { JournalEntryRow } from '@/components/journal/journal-entry-row';
import { JournalHero } from '@/components/journal/journal-hero';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  useJournalStreakQuery,
  useListJournalInfiniteQuery,
  useMeQuery,
  useUpdateMeMutation,
  useUpsertJournalByDateMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { fromDateKey, toDateKey } from '@/lib/date';
import type { JournalEntry } from '@/lib/types';

/** Group entries (already newest-first) under a "Month Year" heading. */
function byMonth(entries: JournalEntry[]): { label: string; items: JournalEntry[] }[] {
  const groups: { label: string; items: JournalEntry[] }[] = [];
  for (const entry of entries) {
    const label = format(fromDateKey(entry.date), 'MMMM yyyy');
    const last = groups.at(-1);
    if (last && last.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  }
  return groups;
}

export default function JournalPage() {
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  const { data: me } = useMeQuery();
  const [updateMe] = useUpdateMeMutation();
  const [upsert] = useUpsertJournalByDateMutation();
  const { data: streak } = useJournalStreakQuery();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useListJournalInfiniteQuery();

  const entries = data ? data.pages.flatMap((p) => p.items) : [];
  const groups = byMonth(entries);

  const setBanner = async (journalBanner: string | null) => {
    try {
      await updateMe({ journalBanner }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change the background'));
    }
  };

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
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Journal"
        actions={
          <Button size="sm" variant="secondary" loading={starting} onClick={writeToday}>
            <PenLine size={15} />
            {streak?.writtenToday ? 'Today' : 'Write today'}
          </Button>
        }
      />

      <JournalHero
        name={me?.user.name || me?.user.username || ''}
        bannerId={me?.user.journalBanner ?? null}
        onChangeBanner={setBanner}
        streak={streak}
        onWrite={writeToday}
        writing={starting}
      />

      <div className="content-column flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <aside className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
            <JournalCalendar />
            {streak && streak.longest > 0 ? (
              <p className="text-ink-faint px-1 text-[12px]">
                Longest streak so far:{' '}
                <span className="text-ink-muted font-medium">
                  {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
                </span>
              </p>
            ) : null}
          </aside>

          <main className="min-w-0 lg:col-start-1 lg:row-start-1">
            {isLoading ? (
              <SkeletonRows />
            ) : entries.length === 0 ? (
              <EmptyState
                icon={<NotebookPen size={22} />}
                title="Your journal is empty"
                description="Start with today — even a sentence counts."
                action={
                  <Button size="sm" onClick={writeToday} loading={starting}>
                    <PenLine size={15} />
                    Write today
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <section key={group.label}>
                    <h2 className="text-ink-faint mb-2 px-1 text-[12px] font-semibold tracking-wide uppercase">
                      {group.label}
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {group.items.map((entry) => (
                        <JournalEntryRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </section>
                ))}

                {hasNextPage ? (
                  <div className="text-center">
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
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
