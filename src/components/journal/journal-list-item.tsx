'use client';

import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { fromDateKey } from '@/lib/date';
import type { JournalEntry } from '@/lib/types';

export function JournalListItem({ entry }: { entry: JournalEntry }) {
  const d = fromDateKey(entry.date);

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="group hover:border-hairline hover:bg-surface flex items-center gap-4 rounded-lg border border-transparent px-3 py-3 transition-colors"
    >
      <div className="w-16 shrink-0 text-right">
        <div className="text-ink text-sm font-medium">{format(d, 'MMM d')}</div>
        <div className="text-ink-faint text-[12px]">{format(d, 'yyyy')}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-ink truncate text-sm">
          {entry.title || format(d, 'EEEE')}
        </div>
        <div className="text-ink-muted truncate text-[13px]">
          {entry.excerpt || 'Empty'}
        </div>
      </div>
      <ChevronRight
        size={15}
        className="text-ink-faint shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
