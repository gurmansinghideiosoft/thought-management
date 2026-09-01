'use client';

import { FileText, Link2, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useActivityInfiniteQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { relativeTime } from '@/lib/format';
import type { EntryKind } from '@/lib/types';

const KIND_ICON: Record<EntryKind, typeof StickyNote> = {
  note: StickyNote,
  link: Link2,
  file: FileText,
};

const KINDS: { value: EntryKind | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'note', label: 'Notes' },
  { value: 'link', label: 'Links' },
  { value: 'file', label: 'Files' },
];

export default function ActivityPage() {
  const [kind, setKind] = useState<EntryKind | ''>('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivityInfiniteQuery(kind ? { kind } : undefined);

  const items = data ? data.pages.flatMap((p) => p.items) : [];

  return (
    <>
      <PageHeader title="Activity" subtitle="Everything you’ve added, newest first" />
      <div className="content-column flex-1 px-4 py-5 sm:px-6">
        <div className="mb-4 flex gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setKind(k.value)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors',
                kind === k.value
                  ? 'border-accent/40 bg-accent/12 text-accent'
                  : 'border-hairline bg-surface text-ink-muted hover:text-ink',
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : items.length === 0 ? (
          <EmptyState title="Nothing yet" description="Add an entry to any thought." />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <Link
                  key={item.id}
                  href={`/thoughts/${item.thought.id}`}
                  className="border-hairline bg-surface hover:bg-surface-2/50 flex gap-3 rounded-xl border px-4 py-3 transition-colors"
                >
                  <Icon size={15} className="text-ink-faint mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-ink line-clamp-2 text-[13.5px] leading-relaxed">
                      {item.body ||
                        item.link?.title ||
                        item.link?.url ||
                        item.file?.originalName ||
                        '(no text)'}
                    </p>
                    <p className="text-ink-faint mt-1 text-[12px]">
                      <span className="text-ink-muted">
                        {item.thought.title ?? 'Untitled'}
                      </span>{' '}
                      · {relativeTime(item.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}

            {hasNextPage ? (
              <div className="pt-2 text-center">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  Load more
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
