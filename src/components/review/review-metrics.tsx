'use client';

import { BookText, CheckCircle2, Lightbulb, Target, Wallet } from 'lucide-react';
import Link from 'next/link';

import { prettyDayShort } from '@/lib/date';
import { formatMoney } from '@/lib/finance/money';
import type { ReviewSummary } from '@/lib/types';
import { DeltaPill } from './delta-pill';
import { ReviewStat } from './review-stat';

const pct = (n: number): string => `${Math.round(n * 100)}%`;

export function FinishedMetric({ tasks }: { tasks: ReviewSummary['tasks'] }) {
  return (
    <ReviewStat
      icon={<CheckCircle2 size={13} />}
      label="Finished"
      value={tasks.done}
      delta={<DeltaPill value={tasks.done - tasks.donePrev} />}
      sub={tasks.open > 0 ? `${tasks.open} still open` : undefined}
    >
      {tasks.list.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {tasks.list.map((task, i) => (
            <li
              key={`${i}-${task.content}`}
              className="flex items-baseline justify-between gap-2 text-[13px]"
            >
              <span className="text-ink-faint min-w-0 flex-1 truncate line-through">
                {task.content}
              </span>
              {task.date ? (
                <span className="text-ink-faint/80 shrink-0 text-[11px]">
                  {prettyDayShort(task.date)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-faint text-[13px]">Nothing marked done this period.</p>
      )}
    </ReviewStat>
  );
}

export function JournalMetric({ journal }: { journal: ReviewSummary['journal'] }) {
  return (
    <ReviewStat
      icon={<BookText size={13} />}
      label="Journal"
      value={`${journal.written} ${journal.written === 1 ? 'day' : 'days'}`}
      delta={<DeltaPill value={journal.written - journal.writtenPrev} suffix="vs last" />}
      sub={
        <>
          {journal.words.toLocaleString()} words
          {journal.streak.current > 0 ? ` · ${journal.streak.current}-day streak` : ''}
        </>
      }
    >
      {journal.list.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {journal.list.slice(0, 5).map((entry) => (
            <li key={entry.id} className="truncate text-[13px]">
              <Link
                href={`/journal/${entry.id}`}
                className="text-ink-muted hover:text-accent"
              >
                {entry.title || entry.excerpt || prettyDayShort(entry.date)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </ReviewStat>
  );
}

export function SpendingMetric({
  finance,
  currency,
}: {
  finance: ReviewSummary['finance'];
  currency: string;
}) {
  const max = finance.byTag[0]?.total ?? 1;
  return (
    <ReviewStat
      icon={<Wallet size={13} />}
      label="Spending"
      value={formatMoney(finance.totalSpending, currency)}
      delta={
        <DeltaPill
          value={Math.round((finance.totalSpending - finance.spendingPrev) * 100) / 100}
          goodWhenUp={false}
          alarmWhenBad
          format={(n) => formatMoney(n, currency)}
        />
      }
      sub={
        <>
          Net{' '}
          <span className={finance.net >= 0 ? 'text-success font-medium' : 'font-medium'}>
            {finance.net < 0 ? '−' : ''}
            {formatMoney(Math.abs(finance.net), currency)}
          </span>
        </>
      }
    >
      {finance.byTag.length > 0 ? (
        <div className="flex flex-col gap-2">
          {finance.byTag.slice(0, 3).map((tag) => (
            <div key={tag.tagId ?? 'untagged'} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2 text-[12px]">
                <span className="text-ink-muted flex min-w-0 items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate">{tag.name}</span>
                </span>
                <span className="text-ink-faint shrink-0 tabular-nums">
                  {formatMoney(tag.total, currency)}
                </span>
              </div>
              <div className="bg-surface-2 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(3, (tag.total / max) * 100)}%`,
                    backgroundColor: tag.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </ReviewStat>
  );
}

export function ThoughtsMetric({ thoughts }: { thoughts: ReviewSummary['thoughts'] }) {
  return (
    <ReviewStat
      icon={<Lightbulb size={13} />}
      label="Thoughts"
      value={thoughts.entriesAdded}
      delta={<DeltaPill value={thoughts.entriesAdded - thoughts.entriesAddedPrev} />}
      sub={
        thoughts.touched > 0
          ? `across ${thoughts.touched} ${thoughts.touched === 1 ? 'thought' : 'thoughts'}`
          : undefined
      }
    >
      {thoughts.list.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {thoughts.list.map((thought) => (
            <li
              key={thought.id}
              className="flex items-baseline justify-between gap-2 text-[13px]"
            >
              <Link
                href={`/thoughts/${thought.id}`}
                className="text-ink-muted hover:text-accent min-w-0 flex-1 truncate"
              >
                {thought.title}
              </Link>
              <span className="text-ink-faint shrink-0 text-[11px] tabular-nums">
                +{thought.count}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </ReviewStat>
  );
}

export function HabitsMetric({ habits }: { habits: ReviewSummary['habits'] }) {
  return (
    <ReviewStat
      icon={<Target size={13} />}
      label="Habits"
      value={pct(habits.overallRate)}
      delta={
        <DeltaPill
          value={Math.round((habits.overallRate - habits.overallRatePrev) * 100)}
          format={(n) => `${n} pts`}
        />
      }
    >
      {habits.items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {habits.items.map((habit) => (
            <li key={habit.name} className="flex items-center gap-2 text-[12px]">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              <span className="text-ink-muted min-w-0 flex-1 truncate">{habit.name}</span>
              <span className="text-ink-faint shrink-0 tabular-nums">
                {habit.done}/{habit.possible}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-faint text-[13px]">No active habits.</p>
      )}
    </ReviewStat>
  );
}
