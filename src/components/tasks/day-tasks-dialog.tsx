'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { useListTasksQuery, useListTaskTagsQuery } from '@/lib/api/api';
import { prettyDay } from '@/lib/date';
import type { TaskFilters } from './task-filter-bar';
import { AddTaskForm } from './add-task-form';
import { TaskRow } from './task-row';

export function DayTasksDialog({
  date,
  open,
  onOpenChange,
  showCompleted,
  filters,
}: {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCompleted: boolean;
  filters: TaskFilters;
}) {
  const { data, isLoading } = useListTasksQuery(
    {
      from: date ?? undefined,
      to: date ?? undefined,
      tags: filters.tagIds,
      priorities: filters.priorities,
    },
    { skip: !date || !open },
  );
  const { data: tags = [] } = useListTaskTagsQuery();

  const all = data?.items ?? [];
  const pending = all.filter((t) => t.status === 'pending');
  const done = all.filter((t) => t.status === 'done');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={date ? prettyDay(date) : ''} className="max-w-lg">
        <div className="flex flex-col gap-4">
          {date ? <AddTaskForm date={date} /> : null}

          {isLoading ? (
            <CenteredSpinner />
          ) : pending.length === 0 && (!showCompleted || done.length === 0) ? (
            <EmptyState title="Nothing planned" description="Add a task above." />
          ) : (
            <div className="flex max-h-[50vh] flex-col gap-0.5 overflow-y-auto">
              {pending.map((task) => (
                <TaskRow key={task.id} task={task} tags={tags} />
              ))}

              {showCompleted && done.length > 0 ? (
                <>
                  <div className="text-ink-faint my-2 flex items-center gap-2 px-2 text-[11px] tracking-wide uppercase">
                    <span>Completed</span>
                    <span className="bg-border h-px flex-1" />
                  </div>
                  {done.map((task) => (
                    <TaskRow key={task.id} task={task} tags={tags} />
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
