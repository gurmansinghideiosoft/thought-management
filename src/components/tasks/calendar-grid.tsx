'use client';

import { Plus } from 'lucide-react';

import { CenteredSpinner } from '@/components/ui/misc';
import { useTaskCalendarQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { monthGrid, WEEKDAYS } from '@/lib/date';
import type { TaskFilters } from './task-filter-bar';

export function CalendarGrid({
  month,
  filters,
  showCompleted,
  onPickDay,
  onQuickAdd,
}: {
  month: string;
  filters: TaskFilters;
  showCompleted: boolean;
  onPickDay: (dateKey: string) => void;
  onQuickAdd: (dateKey: string) => void;
}) {
  const { data, isLoading } = useTaskCalendarQuery({
    month,
    tags: filters.tagIds,
    priorities: filters.priorities,
  });

  if (isLoading) return <CenteredSpinner />;

  const days = monthGrid(month);
  const counts = data?.counts ?? {};

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-3 pb-3 sm:px-4">
      <div className="text-ink-faint grid grid-cols-7 pt-1 pb-2 text-[11px] font-medium tracking-wide uppercase">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2">
            {d}
          </div>
        ))}
      </div>

      <div
        key={month}
        className="border-hairline bg-surface animate-fade-in grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-xl border"
      >
        {days.map((day, i) => {
          const c = counts[day.key] ?? { pending: 0, done: 0 };
          const lastCol = (i + 1) % 7 === 0;
          const lastRow = i >= 35;
          return (
            <div
              key={day.key}
              className={cn(
                'group relative flex min-h-0 flex-col p-1.5',
                !lastCol && 'border-hairline border-r',
                !lastRow && 'border-hairline border-b',
                !day.inMonth && 'bg-surface-2/40',
              )}
            >
              <button
                type="button"
                onClick={() => onPickDay(day.key)}
                aria-label={`Open ${day.key}`}
                className="hover:bg-surface-2/60 absolute inset-0 transition-colors"
              />
              <div className="pointer-events-none relative flex items-center justify-between">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[12.5px] tabular-nums',
                    day.isToday
                      ? 'bg-accent text-accent-fg font-semibold'
                      : day.inMonth
                        ? 'text-ink'
                        : 'text-ink-faint',
                  )}
                >
                  {day.date.getDate()}
                </span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => onQuickAdd(day.key)}
                  aria-label="Add task"
                  className="text-ink-faint hover:bg-surface hover:text-ink pointer-events-auto relative rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="pointer-events-none relative mt-auto flex flex-wrap gap-1">
                {c.pending > 0 ? (
                  <span className="bg-accent/12 text-accent inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-medium">
                    <span className="bg-accent size-1.5 rounded-full" />
                    {c.pending}
                  </span>
                ) : null}
                {showCompleted && c.done > 0 ? (
                  <span className="bg-surface-2 text-ink-faint inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-medium">
                    ✓ {c.done}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
