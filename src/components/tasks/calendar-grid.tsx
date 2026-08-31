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
    <div className="flex flex-1 flex-col">
      <div className="border-border text-ink-faint grid grid-cols-7 border-b px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide uppercase">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const c = counts[day.key] ?? { pending: 0, done: 0 };
          return (
            <button
              key={day.key}
              onClick={() => onPickDay(day.key)}
              className={cn(
                'group border-border hover:bg-surface-2/50 relative flex flex-col border-r border-b p-1.5 text-left transition-colors',
                !day.inMonth && 'bg-surface-2/30 text-ink-faint',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[13px]',
                    day.isToday && 'bg-accent font-semibold text-white',
                    !day.isToday && day.inMonth && 'text-ink',
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
                  <span className="bg-accent-tint text-accent inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-medium">
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
