'use client';

import { CornerUpRight } from 'lucide-react';

import type { SavedReview } from '@/lib/types';

/** The reflection loop: last period's intentions, surfaced first. */
export function CarryForwardCard({
  prev,
  periodNoun,
  onRespond,
}: {
  prev: SavedReview;
  periodNoun: string;
  onRespond: () => void;
}) {
  if (!prev.intentions.trim()) return null;

  return (
    <div className="border-hairline border-l-accent/50 bg-surface rounded-xl border border-l-2 p-4">
      <p className="text-ink-faint mb-2 text-[11px] font-medium tracking-wide uppercase">
        Last {periodNoun} you set out to
      </p>
      <p className="text-ink border-hairline border-l-2 pl-3 text-[14.5px] leading-relaxed whitespace-pre-wrap">
        {prev.intentions}
      </p>
      <button
        type="button"
        onClick={onRespond}
        className="text-accent mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium"
      >
        <CornerUpRight size={14} /> How did that go?
      </button>
    </div>
  );
}
