'use client';

import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { fromDateKey } from '@/lib/date';
import type { JournalEntry } from '@/lib/types';

export function JournalEntryRow({ entry }: { entry: JournalEntry }) {
  const d = fromDateKey(entry.date);
  const empty = entry.wordCount === 0;

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="group border-hairline bg-surface shadow-raised hover:border-ink-faint/40 hover:shadow-popover ease-ios active:shadow-raised flex items-stretch gap-4 rounded-xl border p-4 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 active:translate-y-0 active:duration-75"
    >
      <div className="bg-surface-2/70 border-hairline flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border py-1.5">
        <span className="text-ink font-serif text-xl leading-none font-semibold tabular-nums">
          {format(d, 'd')}
        </span>
        <span className="text-ink-faint mt-0.5 text-[10px] font-medium tracking-wide uppercase">
          {format(d, 'EEE')}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="text-ink truncate font-serif text-[15.5px] font-semibold">
          {entry.title || format(d, 'EEEE, MMMM d')}
        </h3>
        <p className="text-ink-muted mt-0.5 line-clamp-2 text-[13px] leading-relaxed">
          {entry.excerpt || 'Empty — open to write.'}
        </p>
        <span className="text-ink-faint mt-1.5 text-[11.5px]">
          {empty ? 'Not started' : `${entry.wordCount} words`}
        </span>
      </div>

      <ChevronRight
        size={16}
        className="text-ink-faint mt-1 shrink-0 self-center transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
