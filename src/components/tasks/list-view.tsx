'use client';

import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { useListTasksQuery, useListTaskTagsQuery } from '@/lib/api/api';
import { prettyDayShort } from '@/lib/date';
import type { TaskView } from '@/lib/types';
import { AddTaskForm } from './add-task-form';
import type { TaskFilters } from './task-filter-bar';
import { TaskRow } from './task-row';

export function ListView({
  from,
  to,
  filters,
  showCompleted,
}: {
  from: string;
  to: string;
  filters: TaskFilters;
  showCompleted: boolean;
}) {
  const { data, isLoading } = useListTasksQuery({
    from,
    to,
    status: showCompleted ? undefined : 'pending',
    tags: filters.tagIds,
    priorities: filters.priorities,
  });
  const { data: tags = [] } = useListTaskTagsQuery();

  if (isLoading) return <CenteredSpinner />;

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="reading-column px-4 py-8">
        <EmptyState
          title="No tasks this month"
          description="Switch months, or add one on any day from the calendar."
        />
      </div>
    );
  }

  const byDate = new Map<string, TaskView[]>();
  for (const task of items) {
    const list = byDate.get(task.day) ?? [];
    list.push(task);
    byDate.set(task.day, list);
  }

  return (
    <div className="reading-column flex-1 px-4 py-4">
      {[...byDate.entries()].map(([date, dayTasks]) => {
        const pending = dayTasks.filter((t) => t.status === 'pending');
        const done = dayTasks.filter((t) => t.status === 'done');
        return (
          <section key={date} className="mb-5">
            <h2 className="bg-paper/85 text-ink sticky top-0 z-[1] -mx-2 px-2 py-1.5 text-[13px] font-semibold backdrop-blur">
              {prettyDayShort(date)}
              <span className="text-ink-faint ml-2 font-normal">{pending.length}</span>
            </h2>
            <div className="mt-1 flex flex-col gap-0.5">
              {pending.map((task) => (
                <TaskRow key={task.viewKey} task={task} tags={tags} />
              ))}
              {showCompleted &&
                done.map((task) => (
                  <TaskRow key={task.viewKey} task={task} tags={tags} />
                ))}
            </div>
            <div className="mt-1.5 px-2 opacity-60 focus-within:opacity-100 hover:opacity-100">
              <AddTaskForm date={date} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
