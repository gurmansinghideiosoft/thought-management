'use client';

import { cn } from '@/lib/cn';
import type { TransactionKind } from '@/lib/types';

const OPTS: { value: TransactionKind; label: string }[] = [
  { value: 'spending', label: 'Spent' },
  { value: 'earning', label: 'Earned' },
];

export function KindToggle({
  value,
  onChange,
  className,
}: {
  value: TransactionKind;
  onChange: (kind: TransactionKind) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('border-hairline bg-surface flex rounded-lg border p-0.5', className)}
    >
      {OPTS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'h-7 flex-1 rounded-md px-2 text-[12px] transition-colors',
            value === o.value
              ? o.value === 'earning'
                ? 'bg-success/15 text-success font-medium'
                : 'bg-surface-2 text-ink font-medium'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
