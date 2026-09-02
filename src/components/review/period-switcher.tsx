'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { IconButton } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { ReviewPeriod } from '@/lib/types';

export function PeriodSwitcher({
  period,
  onPeriodChange,
  onStep,
  label,
  isCurrent,
  onReset,
}: {
  period: ReviewPeriod;
  onPeriodChange: (p: ReviewPeriod) => void;
  onStep: (dir: -1 | 1) => void;
  label: string;
  isCurrent: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="border-hairline flex rounded-lg border p-0.5">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange(p)}
            className={cn(
              'h-7 rounded-md px-2.5 text-[12px] font-medium capitalize transition-colors',
              period === p ? 'bg-surface-2 text-ink' : 'text-ink-faint hover:text-ink',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center">
        <IconButton label="Previous period" className="size-7" onClick={() => onStep(-1)}>
          <ChevronLeft size={16} />
        </IconButton>
        <span className="text-ink-muted min-w-[92px] text-center text-[12px] font-medium tabular-nums">
          {label}
        </span>
        <IconButton
          label="Next period"
          className="size-7"
          onClick={() => onStep(1)}
          disabled={isCurrent}
        >
          <ChevronRight size={16} />
        </IconButton>
      </div>

      {isCurrent ? null : (
        <button
          type="button"
          onClick={onReset}
          className="text-accent text-[12px] font-medium"
        >
          This {period}
        </button>
      )}
    </div>
  );
}
