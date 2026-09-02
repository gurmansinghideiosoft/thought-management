import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * A momentum indicator. "Did less" is never alarming — it renders muted. The
 * one loud case is a rise that's actually bad (spending up): pass `alarmWhenBad`.
 */
export function DeltaPill({
  value,
  goodWhenUp = true,
  alarmWhenBad = false,
  format = (n) => String(n),
  suffix = 'vs last',
}: {
  value: number;
  goodWhenUp?: boolean;
  alarmWhenBad?: boolean;
  format?: (n: number) => string;
  suffix?: string;
}) {
  if (value === 0) {
    return (
      <span className="text-ink-faint inline-flex items-center gap-1 text-[12px]">
        <Minus size={12} /> even {suffix}
      </span>
    );
  }

  const up = value > 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[12px] font-medium',
        good ? 'text-success' : alarmWhenBad ? 'text-danger' : 'text-ink-faint',
      )}
    >
      <Icon size={12} />
      {up ? '+' : '−'}
      {format(Math.abs(value))} {suffix}
    </span>
  );
}
