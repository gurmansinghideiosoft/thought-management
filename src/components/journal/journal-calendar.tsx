'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { IconButton } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useJournalCalendarQuery, useUpsertJournalByDateMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { monthGrid, prettyMonth, shiftMonth, toDateKey, toMonthKey } from '@/lib/date';

export function JournalCalendar() {
  const router = useRouter();
  const toast = useToast();
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const { data, isFetching } = useJournalCalendarQuery(month);
  const [openDay, { isLoading: opening }] = useUpsertJournalByDateMutation();

  const today = toDateKey(new Date());
  const written = new Set(data?.dates ?? []);
  const days = monthGrid(month);

  const go = async (key: string) => {
    if (key > today || opening) return;
    try {
      const entry = await openDay({ date: key }).unwrap();
      router.push(`/journal/${entry.id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not open that day'));
    }
  };

  return (
    <div className="border-hairline bg-surface rounded-xl border p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-ink font-serif text-sm font-semibold">
          {prettyMonth(month)}
        </span>
        <div className="flex items-center gap-0.5">
          {isFetching ? <Spinner className="mr-1 size-3" /> : null}
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

      <div className="text-ink-faint mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const has = written.has(day.key);
          const future = day.key > today;
          return (
            <button
              key={day.key}
              type="button"
              disabled={future}
              onClick={() => void go(day.key)}
              title={has ? 'Open this entry' : future ? undefined : 'Write for this day'}
              className={cn(
                'relative grid aspect-square place-items-center rounded-md text-[12px] tabular-nums transition-colors',
                !day.inMonth && 'text-ink-faint/50',
                day.inMonth && !has && 'text-ink-muted',
                has && 'bg-accent/15 text-accent font-semibold',
                day.isToday && 'ring-accent ring-1',
                future ? 'cursor-default opacity-40' : 'hover:bg-surface-2',
              )}
            >
              {day.date.getDate()}
              {has ? (
                <span className="bg-accent absolute bottom-1 size-1 rounded-full" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
