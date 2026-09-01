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

      <div className="border-hairline bg-surface grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-xl border">
        {days.map((day, i) => {
          const c = counts[day.key] ?? { pending: 0, done: 0 };
          const lastCol = (i + 1) % 7 === 0;
          const lastRow = i >= 35;
          return (
            <button
              key={day.key}
              onClick={() => onPickDay(day.key)}
              className={cn(
                'group hover:bg-surface-2/60 relative flex min-h-0 flex-col p-1.5 text-left transition-colors',
                !lastCol && 'border-hairline border-r',
                !lastRow && 'border-hairline border-b',
                !day.inMonth && 'bg-surface-2/40 text-ink-faint',
              )}
            >
              <div className="flex items-center justify-between">
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
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(day.key);
                  }}
                  role="button"
                  tabIndex={-1}
                  className="text-ink-faint hover:bg-surface hover:text-ink rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Add task"
                >
                  <Plus size={13} />
                </span>
              </div>

              <div className="mt-auto flex flex-wrap gap-1">
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
