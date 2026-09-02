'use client';

import { useState } from 'react';

import { useListReviewsQuery } from '@/lib/api/api';
import type { ReviewPeriod } from '@/lib/types';

export function PastReviews({
  period,
  onOpen,
}: {
  period: ReviewPeriod;
  onOpen: (periodKey: string) => void;
}) {
  const { data } = useListReviewsQuery({ period, limit: 12 });
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) return null;
  const shown = expanded ? data : data.slice(0, 3);

  return (
    <div className="border-hairline bg-surface rounded-xl border p-4">
      <p className="text-ink-faint mb-1 text-[11px] font-medium tracking-wide uppercase">
        Past reviews · {data.length}
      </p>
      <ul>
        {shown.map((review) => {
          const gist =
            review.intentions.split('\n')[0] || review.reflection.split('\n')[0] || '—';
          return (
            <li key={review.id} className="border-hairline border-b last:border-b-0">
              <button
                type="button"
                onClick={() => onOpen(review.periodKey)}
                className="flex w-full items-center gap-3 py-2 text-left"
              >
                <span className="text-ink shrink-0 text-[13px] font-medium tabular-nums">
                  {review.periodKey}
                </span>
                <span className="text-ink-faint min-w-0 flex-1 truncate text-[12px]">
                  {gist}
                </span>
                {review.rating ? (
                  <span className="text-accent shrink-0 text-[10px] tracking-tight">
                    {'●'.repeat(review.rating)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {data.length > 3 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-ink-muted hover:text-ink mt-1.5 text-[12px] font-medium"
        >
          {expanded ? 'Show less' : `Show all ${data.length}`}
        </button>
      ) : null}
    </div>
  );
}
