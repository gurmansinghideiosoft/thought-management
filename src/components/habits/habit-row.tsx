'use client';

import { Check, ChevronDown, Flame, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { HabitHeatmap } from '@/components/habits/habit-heatmap';
import { IconButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSetHabitEntryMutation } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import type { Habit } from '@/lib/types';

const TODAY = toDateKey(new Date());

export function HabitRow({ habit }: { habit: Habit }) {
  const [setEntry, { isLoading }] = useSetHabitEntryMutation();
  const [open, setOpen] = useState(false);

  const set = (value: number) =>
    void setEntry({ habitId: habit.id, date: TODAY, value: Math.max(0, value) });

  return (
    <div className="border-hairline bg-surface rounded-xl border">
      <div className="flex items-center gap-3 p-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Hide calendar' : 'Show calendar'}
          aria-expanded={open}
          className="text-ink-faint hover:text-ink -m-1 shrink-0 rounded-md p-1"
        >
          <ChevronDown
            size={15}
            className={cn('transition-transform', open && 'rotate-180')}
          />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-ink truncate text-sm font-medium">{habit.name}</p>
          {habit.currentStreak > 0 ? (
            <span className="text-accent mt-0.5 inline-flex items-center gap-1 text-[12px]">
              <Flame size={12} />
              {habit.currentStreak} day{habit.currentStreak === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="text-ink-faint mt-0.5 block text-[12px]">
              {habit.doneToday ? 'Done today' : 'Not yet today'}
            </span>
          )}
        </div>

        {habit.type === 'binary' ? (
          <Checkbox
            checked={habit.doneToday}
            onCheckedChange={(c) => set(c ? 1 : 0)}
            aria-label={
              habit.doneToday ? `Unmark ${habit.name}` : `Mark ${habit.name} done`
            }
            className="size-6 shrink-0"
          />
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              label="Minus one"
              className="size-7"
              disabled={isLoading || habit.todayValue === 0}
              onClick={() => set(habit.todayValue - 1)}
            >
              <Minus size={14} />
            </IconButton>
            <span
              className={cn(
                'inline-flex min-w-[4.5rem] items-center justify-center gap-1 text-sm tabular-nums',
                habit.doneToday && 'text-success font-medium',
              )}
            >
              {habit.doneToday ? <Check size={13} /> : null}
              {habit.todayValue}
              <span className="text-ink-faint">/ {habit.target}</span>
            </span>
            <IconButton
              label="Plus one"
              className="size-7"
              disabled={isLoading}
              onClick={() => set(habit.todayValue + 1)}
            >
              <Plus size={14} />
            </IconButton>
          </div>
        )}
      </div>

      {open ? (
        <div className="px-3.5 pb-3.5">
          <HabitHeatmap habit={habit} />
        </div>
      ) : null}
    </div>
  );
}
