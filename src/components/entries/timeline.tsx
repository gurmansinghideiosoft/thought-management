'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import { CenteredSpinner, EmptyState, Spinner } from '@/components/ui/misc';
import { type TimelineArgs, useTimelineInfiniteQuery } from '@/lib/api/api';
import type { Tag } from '@/lib/types';
import { EntryItem } from './entry-item';

export function Timeline({
  args,
  tags,
  readOnly = false,
}: {
  args: TimelineArgs;
  tags: Tag[];
  readOnly?: boolean;
}) {
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTimelineInfiniteQuery(args);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const prevHeight = useRef(0);
  const pinnedToBottom = useRef(false);
  const pageCount = data?.pages.length ?? 0;

  // Fully ascending (oldest first): the API returns newest chunk first, and each
  // "next page" is an older chunk.
  const entries = data ? [...data.pages].reverse().flatMap((p) => p.items) : [];
  const entryCount = entries.length;

  const filterKey = `${args.tagId ?? ''}|${String(args.starred ?? '')}|${args.kind ?? ''}|${args.q ?? ''}`;

  // On first load / filter change, jump to the newest entry.
  useEffect(() => {
    pinnedToBottom.current = false;
  }, [filterKey]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!pinnedToBottom.current && entryCount > 0) {
      el.scrollTop = el.scrollHeight;
      pinnedToBottom.current = true;
      return;
    }
    // Older page just prepended — keep the viewport where it was.
    if (prevHeight.current > 0) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = 0;
    }
  }, [pageCount, entryCount, filterKey]);

  useEffect(() => {
    const sentinel = topSentinel.current;
    const scroller = scrollRef.current;
    if (!sentinel || !scroller || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (records) => {
        if (records[0]?.isIntersecting && !isFetchingNextPage) {
          prevHeight.current = scroller.scrollHeight;
          void fetchNextPage();
        }
      },
      { root: scroller, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <CenteredSpinner />;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="reading-column px-4 py-6">
        {hasNextPage ? (
          <div ref={topSentinel} className="flex justify-center py-2">
            {isFetchingNextPage ? <Spinner /> : null}
          </div>
        ) : entryCount > 0 ? (
          <p className="text-ink-faint pb-4 text-center text-[12px]">
            The beginning of this thought
          </p>
        ) : null}

        {entryCount === 0 ? (
          <EmptyState
            title={isFetching ? 'Loading…' : 'Nothing here yet'}
            description={
              args.tagId || args.starred || args.kind || args.q
                ? 'No entries match this filter.'
                : 'Add the first note using the box below.'
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <EntryItem
                key={entry.id}
                entry={entry}
                thoughtId={args.thoughtId}
                tags={tags}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
