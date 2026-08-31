'use client';

import { format } from 'date-fns';
import Link from 'next/link';

import { fromDateKey } from '@/lib/date';
import type { JournalEntry } from '@/lib/types';

export function JournalCard({ entry }: { entry: JournalEntry }) {
  const d = fromDateKey(entry.date);

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="group border-border bg-surface relative flex h-56 flex-col rounded-xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-ink-muted text-[13px] font-medium">
          {format(d, 'EEEE')}
        </span>
        <span className="text-ink-faint text-[12px]">{format(d, 'MMM d')}</span>
      </div>

      <h3 className="text-ink mb-1.5 line-clamp-2 font-semibold">
        {entry.title || format(d, 'MMMM d, yyyy')}
      </h3>

      <p className="text-ink-muted line-clamp-5 flex-1 text-[13.5px] leading-relaxed">
        {entry.excerpt || 'Empty — open to write.'}
      </p>

      <span className="text-ink-faint mt-2 text-[12px]">
        {entry.wordCount > 0 ? `${entry.wordCount} words` : 'Not started'}
      </span>
    </Link>
  );
}
