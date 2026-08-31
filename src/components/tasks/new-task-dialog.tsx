'use client';

import { CalendarDays, CalendarRange } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useCreateTaskMutation, useListTaskTagsQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import type { Priority } from '@/lib/priority';
import type { RangeMode } from '@/lib/types';
import { PrioritySelect } from './priority';

type Mode = 'single' | 'range';

const dateInputClass =
  'border-hairline bg-field text-ink focus:border-accent/55 focus:ring-accent/20 h-9 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none';

export function NewTaskDialog({
  trigger,
  defaultDate,
}: {
  trigger: React.ReactNode;
  defaultDate?: string;
}) {
  const toast = useToast();
  const { data: tags } = useListTaskTagsQuery();
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const today = toDateKey(new Date());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('single');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(defaultDate ?? today);
  const [startDate, setStartDate] = useState(defaultDate ?? today);
  const [endDate, setEndDate] = useState(defaultDate ?? today);
  const [rangeMode, setRangeMode] = useState<RangeMode>('once');
  const [priority, setPriority] = useState<Priority>(3);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const reset = () => {
    setMode('single');
    setContent('');
    setDate(defaultDate ?? today);
    setStartDate(defaultDate ?? today);
    setEndDate(defaultDate ?? today);
    setRangeMode('once');
    setPriority(3);
    setTagIds([]);
  };

  const datesMissing = mode === 'range' ? !startDate || !endDate : !date;
  const rangeInvalid = mode === 'range' && !datesMissing && startDate > endDate;
  const canSubmit = !!content.trim() && !datesMissing && !rangeInvalid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createTask(
        mode === 'range'
          ? {
              kind: 'range',
              content: content.trim(),
              startDate,
              endDate,
              rangeMode,
              priority,
              tagIds: tagIds.length ? tagIds : undefined,
            }
          : {
              content: content.trim(),
              date,
              priority,
              tagIds: tagIds.length ? tagIds : undefined,
            },
      ).unwrap();
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the task'));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title="New task" className="max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            value={content}
            autoFocus
            onChange={(e) => setContent(e.target.value)}
            placeholder="What needs doing?"
            maxLength={500}
            className="border-hairline bg-field text-ink placeholder:text-ink-faint focus:border-accent/55 focus:ring-accent/20 h-10 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
          />

          <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
            {(
              [
                ['single', 'One day', CalendarDays],
                ['range', 'Range', CalendarRange],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] transition-colors',
                  mode === value
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {mode === 'single' ? (
            <label className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-ink-muted font-medium">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={dateInputClass}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[13px]">
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={cn(dateInputClass, 'flex-1')}
                />
                <span className="text-ink-faint">→</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={cn(dateInputClass, 'flex-1')}
                />
              </div>
              {rangeInvalid ? (
                <p className="text-danger text-[13px]">
                  The end date can’t be before the start date.
                </p>
              ) : null}

              <div className="flex flex-col gap-1.5">
                {(
                  [
                    ['once', 'Do it once', 'One task, shown every day until it’s done.'],
                    ['daily', 'Every day', 'A fresh checkbox on each day of the range.'],
                  ] as const
                ).map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRangeMode(value)}
                    className={cn(
                      'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors',
                      rangeMode === value
                        ? 'border-accent/40 bg-accent/8'
                        : 'border-hairline hover:bg-surface-2/60',
                    )}
                  >
                    <span className="text-ink text-[13px] font-medium">{label}</span>
                    <span className="text-ink-faint text-[12px]">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-muted text-[13px] font-medium">Priority</span>
            <PrioritySelect value={priority} onChange={setPriority} />
          </div>

          {(tags ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {(tags ?? []).map((t) => {
                const on = tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setTagIds(
                        on ? tagIds.filter((id) => id !== t.id) : [...tagIds, t.id],
                      )
                    }
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-none transition-colors',
                      on
                        ? 'border-accent/40 bg-accent/12 text-accent'
                        : 'border-hairline bg-surface text-ink-faint hover:text-ink',
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-1"
            loading={isLoading}
            disabled={!canSubmit}
          >
            Add task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
