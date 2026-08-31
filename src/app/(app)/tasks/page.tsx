'use client';

import { CalendarDays, ChevronLeft, ChevronRight, List, Tags } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { CalendarGrid } from '@/components/tasks/calendar-grid';
import { DayTasksDialog } from '@/components/tasks/day-tasks-dialog';
import { ListView } from '@/components/tasks/list-view';
import { TaskFilterBar, type TaskFilters } from '@/components/tasks/task-filter-bar';
import { TaskTagManager } from '@/components/tasks/task-tag-manager';
import { Button, IconButton } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { monthRange, prettyMonth, shiftMonth, toMonthKey } from '@/lib/date';

type View = 'calendar' | 'list';

export default function TasksPage() {
  const [view, setView] = useState<View>('calendar');
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const [showCompleted, setShowCompleted] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({ tagIds: [], priorities: [] });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(false);

  const openDay = (dateKey: string) => {
    setSelectedDay(dateKey);
    setDayOpen(true);
  };

  const { from, to } = monthRange(month);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Tasks"
        actions={
          <div className="flex items-center gap-2">
            <label className="text-ink-muted flex cursor-pointer items-center gap-1.5 text-[13px]">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="accent-accent size-3.5"
              />
              Show completed
            </label>

            <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
              {(
                [
                  ['calendar', CalendarDays],
                  ['list', List],
                ] as const
              ).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] capitalize transition-colors',
                    view === v
                      ? 'bg-surface-2 text-ink font-medium'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <Icon size={14} />
                  {v}
                </button>
              ))}
            </div>

            <TaskTagManager
              trigger={
                <Button size="sm" variant="secondary">
                  <Tags size={14} />
                  Tags
                </Button>
              }
            />
          </div>
        }
      />

      <div className="border-hairline bg-paper/70 flex items-center gap-1 border-b px-4 py-2">
        <IconButton
          label="Previous month"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft size={16} />
        </IconButton>
        <span className="text-ink min-w-[9.5rem] text-center text-sm font-medium">
          {prettyMonth(month)}
        </span>
        <IconButton label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          <ChevronRight size={16} />
        </IconButton>
        <Button
          size="sm"
          variant="ghost"
          className="ml-1 h-7"
          onClick={() => setMonth(toMonthKey(new Date()))}
        >
          Today
        </Button>
      </div>

      <TaskFilterBar value={filters} onChange={setFilters} />

      {view === 'calendar' ? (
        <CalendarGrid
          month={month}
          filters={filters}
          showCompleted={showCompleted}
          onPickDay={openDay}
          onQuickAdd={openDay}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ListView from={from} to={to} filters={filters} showCompleted={showCompleted} />
        </div>
      )}

      <DayTasksDialog
        date={selectedDay}
        open={dayOpen}
        onOpenChange={setDayOpen}
        showCompleted={showCompleted}
        filters={filters}
      />
    </div>
  );
}
