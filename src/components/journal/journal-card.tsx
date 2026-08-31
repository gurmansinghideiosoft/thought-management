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
      className="group border-hairline bg-surface hover:border-ink-faint/40 relative flex h-60 flex-col rounded-xl border p-5 shadow-[0_1px_2px_rgba(26,23,18,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(26,23,18,0.1)]"
    >
      {/* stacked-paper edge */}
      <span className="border-hairline bg-surface/70 absolute inset-x-3 -bottom-1 h-2 rounded-b-xl border" />
      <span className="border-hairline bg-surface/40 absolute inset-x-2 -bottom-2 h-2 rounded-b-xl border" />

      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-ink-faint text-[12px] font-medium tracking-wide uppercase">
          {format(d, 'EEE')}
        </span>
        <span className="text-ink-muted font-serif text-[13px]">
          {format(d, 'MMM d')}
        </span>
      </div>

      <h3 className="text-ink mb-1.5 line-clamp-2 font-serif text-[17px] leading-snug font-semibold">
        {entry.title || format(d, 'MMMM d')}
      </h3>

      <p className="text-ink-muted line-clamp-4 flex-1 text-[13px] leading-relaxed">
        {entry.excerpt || 'Empty — open to write.'}
      </p>

      <span className="border-hairline text-ink-faint mt-3 border-t pt-2.5 text-[11.5px]">
        {entry.wordCount > 0 ? `${entry.wordCount} words` : 'Not started'}
      </span>
    </Link>
  );
}
