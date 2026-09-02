'use client';

import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';

export interface DateRange {
  from: string;
  to: string;
}

const key = toDateKey;

function presets(): { label: string; range: DateRange }[] {
  const now = new Date();
  return [
    {
      label: 'This month',
      range: { from: key(startOfMonth(now)), to: key(endOfMonth(now)) },
    },
    {
      label: 'Last month',
      range: {
        from: key(startOfMonth(subMonths(now, 1))),
        to: key(endOfMonth(subMonths(now, 1))),
      },
    },
    {
      label: 'Last 30 days',
      range: { from: key(subDays(now, 29)), to: key(now) },
    },
    {
      label: 'This year',
      range: { from: key(startOfYear(now)), to: key(endOfYear(now)) },
    },
  ];
}

export function defaultRange(): DateRange {
  return presets()[0].range;
}

export function FinanceRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const opts = presets();
  const activeLabel = opts.find(
    (o) => o.range.from === value.from && o.range.to === value.to,
  )?.label;

  return (
    <div className="border-hairline bg-paper/70 flex flex-wrap items-center gap-2 border-b px-4 py-2.5 sm:px-6">
      <div className="flex flex-wrap gap-1">
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.range)}
            className={cn(
              'h-7 rounded-md px-2.5 text-[12px] transition-colors',
              activeLabel === o.label
                ? 'bg-surface-2 text-ink font-medium'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="text-ink-faint flex items-center gap-1.5 text-[12px] sm:ml-auto">
        <Input
          type="date"
          value={value.from}
          max={value.to}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="h-8 w-auto text-[12px]"
        />
        <span>to</span>
        <Input
          type="date"
          value={value.to}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="h-8 w-auto text-[12px]"
        />
      </div>
    </div>
  );
}
