'use client';

import { Check, Flame, ListChecks } from 'lucide-react';
import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useListHabitsQuery, useSetHabitEntryMutation } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';

const TODAY = toDateKey(new Date());

export function HabitsToday() {
  const { data: habits, isLoading } = useListHabitsQuery({ date: TODAY });
  const [setEntry] = useSetHabitEntryMutation();

  const done = habits?.filter((h) => h.doneToday).length ?? 0;

  return (
    <section className="border-hairline bg-surface flex flex-col rounded-2xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink flex items-center gap-2 font-serif text-base font-semibold">
          <ListChecks size={16} className="text-ink-faint" />
          Habits
        </h2>
        {habits && habits.length > 0 ? (
          <Link
            href="/habits"
            className="text-ink-faint hover:text-ink text-[12px] tabular-nums"
          >
            {done}/{habits.length}
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <SkeletonRows bare rows={3} />
      ) : !habits || habits.length === 0 ? (
        <Link href="/habits" className="text-ink-muted text-sm hover:underline">
          Set up your daily habits →
        </Link>
      ) : (
        <ul className="flex flex-col gap-1">
          {habits.slice(0, 6).map((h) => {
            const set = (value: number) =>
              void setEntry({ habitId: h.id, date: TODAY, value });
            return (
              <li key={h.id} className="flex items-center gap-2.5 py-1">
                {h.type === 'binary' ? (
                  <Checkbox
                    checked={h.doneToday}
                    onCheckedChange={(c) => set(c ? 1 : 0)}
                    aria-label={h.name}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => set(h.doneToday ? 0 : h.target)}
                    aria-label={h.name}
                    className={cn(
                      'grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors',
                      h.doneToday
                        ? 'border-accent bg-accent text-accent-fg'
                        : 'border-hairline hover:border-accent',
                    )}
                  >
                    {h.doneToday ? <Check size={11} strokeWidth={3} /> : null}
                  </button>
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[13.5px]',
                    h.doneToday ? 'text-ink-faint line-through' : 'text-ink',
                  )}
                >
                  {h.name}
                </span>
                {h.type === 'count' && !h.doneToday ? (
                  <span className="text-ink-faint text-[12px] tabular-nums">
                    {h.todayValue}/{h.target}
                  </span>
                ) : null}
                {h.currentStreak > 0 ? (
                  <span className="text-accent inline-flex items-center gap-0.5 text-[11px]">
                    <Flame size={11} />
                    {h.currentStreak}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
