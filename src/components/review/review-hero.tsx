'use client';

import { Check, Flame } from 'lucide-react';

import { fromDateKey, prettyMonth, prettyRange } from '@/lib/date';
import type { ReviewSummary } from '@/lib/types';

const ordinal = (n: number): string => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  const suffix = rem10 === 1 ? 'st' : rem10 === 2 ? 'nd' : rem10 === 3 ? 'rd' : 'th';
  return `${n}${suffix}`;
};

const daysLeft = (to: string): number => {
  const end = fromDateKey(to);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86_400_000));
};

const plural = (n: number, one: string): string => `${n} ${n === 1 ? one : `${one}s`}`;

export function ReviewHero({ summary }: { summary: ReviewSummary }) {
  const { period, range, tasks, journal, thoughts, finance, habits } = summary;
  const noun = period;
  const Noun = period === 'week' ? 'Week' : 'Month';
  const rangeLabel =
    period === 'week'
      ? prettyRange(range.from, range.to)
      : prettyMonth(summary.periodKey);
  const done = Boolean(summary.saved?.completedAt);

  const nothing =
    tasks.done === 0 &&
    journal.written === 0 &&
    thoughts.entriesAdded === 0 &&
    finance.totalSpending === 0 &&
    habits.items.length === 0;

  const bits: string[] = [];
  if (tasks.done) bits.push(`finished ${plural(tasks.done, 'task')}`);
  if (journal.written) bits.push(`wrote on ${plural(journal.written, 'day')}`);
  if (thoughts.entriesAdded) {
    bits.push(
      `added ${plural(thoughts.entriesAdded, 'note')} across ${plural(
        thoughts.touched,
        'thought',
      )}`,
    );
  }
  const sentence =
    bits.length === 0
      ? ''
      : bits.length === 1
        ? `You ${bits[0]}.`
        : `You ${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}.`;

  const left = summary.isCurrent ? daysLeft(range.to) : 0;

  return (
    <div className="border-hairline bg-surface rounded-xl border p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-ink-faint text-[12px] font-medium tracking-wide uppercase">
          {summary.isCurrent ? `This ${noun}` : `${Noun} in review`} · {rangeLabel}
        </p>
        {done ? (
          <span className="text-success inline-flex items-center gap-1 text-[12px] font-medium">
            <Check size={13} /> Reviewed
          </span>
        ) : null}
      </div>

      <h1 className="text-ink mt-1 font-serif text-2xl font-semibold">
        {done ? `${Noun} reviewed. Onward.` : `Your ${noun} in review`}
      </h1>

      {nothing ? (
        <p className="text-ink-muted mt-2 max-w-lg text-sm leading-relaxed">
          Nothing tracked this {noun} yet — still worth setting one intention for next{' '}
          {noun}.
        </p>
      ) : sentence ? (
        <p className="text-ink-muted mt-2 max-w-lg text-sm leading-relaxed">{sentence}</p>
      ) : null}

      {summary.completedStreak > 0 || left > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {summary.completedStreak > 0 ? (
            <span className="bg-surface-2 text-ink inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium">
              <Flame size={13} className="text-accent" />
              {ordinal(summary.completedStreak)} {noun} running
            </span>
          ) : null}
          {left > 0 ? (
            <span className="text-ink-faint text-[12px]">
              in progress — {plural(left, 'day')} left
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
