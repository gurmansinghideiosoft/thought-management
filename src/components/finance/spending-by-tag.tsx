'use client';

import { useState } from 'react';

import { formatMoney } from '@/lib/finance/money';
import type { TagSpend } from '@/lib/types';

const INITIAL = 6;

export function SpendingByTag({
  byTag,
  total,
  currency,
}: {
  byTag: TagSpend[];
  total: number;
  currency: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (byTag.length === 0) {
    return (
      <p className="text-ink-faint border-hairline rounded-xl border border-dashed px-4 py-6 text-center text-sm">
        No spending in this range yet.
      </p>
    );
  }

  const max = byTag[0]?.total ?? 1;
  const shown = expanded ? byTag : byTag.slice(0, INITIAL);

  return (
    <div className="flex flex-col gap-3">
      {shown.map((row) => {
        const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
        return (
          <div key={row.tagId ?? 'untagged'} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="truncate">{row.name}</span>
                <span className="text-ink-faint text-[12px]">{pct}%</span>
              </span>
              <span className="text-ink shrink-0 font-medium tabular-nums">
                {formatMoney(row.total, currency)}
              </span>
            </div>
            <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(2, (row.total / max) * 100)}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        );
      })}

      {byTag.length > INITIAL ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-ink-muted hover:text-ink self-start text-[13px] font-medium"
        >
          {expanded ? 'Show less' : `Show all ${byTag.length}`}
        </button>
      ) : null}
    </div>
  );
}
