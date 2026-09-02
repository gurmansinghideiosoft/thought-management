'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { IconButton } from '@/components/ui/button';
import { useHabitMonthQuery, useSetHabitEntryMutation } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { monthGrid, prettyMonth, shiftMonth, toDateKey, toMonthKey } from '@/lib/date';
import type { Habit } from '@/lib/types';

const TODAY = toDateKey(new Date());
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitHeatmap({ habit }: { habit: Habit }) {
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const { data } = useHabitMonthQuery({ habitId: habit.id, month });
  const [setEntry] = useSetHabitEntryMutation();

  const valueByDate = useMemo(
    () => new Map((data?.days ?? []).map((d) => [d.date, d.value])),
    [data],
  );
  const grid = useMemo(() => monthGrid(month), [month]);

  const toggle = (date: string) => {
    const cur = valueByDate.get(date) ?? 0;
    const done = habit.type === 'binary' ? cur >= 1 : cur >= habit.target;
    const next = done ? 0 : habit.type === 'binary' ? 1 : habit.target;
    void setEntry({ habitId: habit.id, date, value: next });
  };

  return (
    <div className="border-hairline mt-2 rounded-xl border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-ink text-[13px] font-medium">{prettyMonth(month)}</span>
        <div className="flex items-center">
          <IconButton
            label="Previous month"
            className="size-7"
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <ChevronLeft size={15} />
          </IconButton>
          <IconButton
            label="Next month"
            className="size-7"
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight size={15} />
          </IconButton>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d, i) => (
          <span key={i} className="text-ink-faint text-center text-[10px]">
            {d}
          </span>
        ))}
        {grid.map((day) => {
          const v = valueByDate.get(day.key) ?? 0;
          const future = day.key > TODAY;
          const p =
            habit.type === 'binary' ? (v >= 1 ? 1 : 0) : Math.min(v / habit.target, 1);
          return (
            <button
              key={day.key}
              type="button"
              disabled={future || !day.inMonth}
              onClick={() => toggle(day.key)}
              title={`${day.key}${v ? ` · ${v}` : ''}`}
              className={cn(
                'aspect-square rounded-md border text-[10px] transition-colors',
                !day.inMonth && 'invisible',
                future
                  ? 'border-transparent'
                  : 'border-hairline hover:border-ink-faint/50',
                day.isToday && 'ring-accent/40 ring-1',
              )}
              style={
                p > 0
                  ? {
                      backgroundColor: `color-mix(in oklab, ${habit.color} ${Math.max(22, p * 100)}%, transparent)`,
                      borderColor: 'transparent',
                    }
                  : undefined
              }
            >
              <span className={cn('block', p > 0.55 ? 'text-white' : 'text-ink-faint')}>
                {day.date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
