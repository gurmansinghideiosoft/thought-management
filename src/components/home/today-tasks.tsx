'use client';

import { ArrowRight, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AddTaskForm } from '@/components/tasks/add-task-form';
import { PriorityDot } from '@/components/tasks/priority';
import { Checkbox } from '@/components/ui/checkbox';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useListTasksQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import { useTaskToggle } from '@/lib/tasks/use-task-toggle';
import type { TaskView } from '@/lib/types';

export function TodayTasks() {
  const today = toDateKey(new Date());
  const { data, isLoading } = useListTasksQuery({ from: today, to: today });
  const toggleTask = useTaskToggle();
  // Optimistic overrides while a toggle is in flight, keyed by viewKey.
  const [pending, setPending] = useState<Record<string, 'pending' | 'done'>>({});

  const items = (data?.items ?? []).filter((t) => t.day === today);
  const statusOf = (t: TaskView) => pending[t.viewKey] ?? t.status;
  const pendingList = items.filter((t) => statusOf(t) === 'pending');
  const doneList = items.filter((t) => statusOf(t) === 'done');

  const toggle = async (t: TaskView) => {
    const next = statusOf(t) === 'done' ? 'pending' : 'done';
    setPending((p) => ({ ...p, [t.viewKey]: next }));
    try {
      await toggleTask(t, next);
    } catch {
      setPending((p) => {
        const rest = { ...p };
        delete rest[t.viewKey];
        return rest;
      });
    }
  };

  const Line = ({ task }: { task: TaskView }) => {
    const done = statusOf(task) === 'done';
    return (
      <li className="flex items-start gap-2.5 py-1">
        <Checkbox
          checked={done}
          onCheckedChange={() => void toggle(task)}
          aria-label={done ? 'Mark not done' : 'Mark done'}
          className="mt-0.5"
        />
        <span
          className={cn(
            'min-w-0 flex-1 text-[13.5px] leading-snug',
            done ? 'text-ink-faint line-through' : 'text-ink',
          )}
        >
          {task.content}
        </span>
        <PriorityDot priority={task.priority} className="mt-1.5" />
      </li>
    );
  };

  return (
    <section className="border-hairline bg-surface flex flex-col rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink flex items-center gap-2 font-serif text-[15px] font-semibold">
          <ListTodo size={16} className="text-ink-faint" />
          Today
        </h2>
        <Link
          href="/tasks"
          className="text-ink-faint hover:text-ink inline-flex items-center gap-1 text-[12px]"
        >
          All tasks <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <SkeletonRows bare rows={3} />
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-ink-faint py-3 text-center text-sm">
              Nothing scheduled for today.
            </p>
          ) : (
            <>
              <p className="text-ink-muted mb-1.5 text-[12px]">
                {doneList.length} done · {pendingList.length} to go
              </p>
              <ul className="flex flex-col">
                {pendingList.map((t) => (
                  <Line key={t.viewKey} task={t} />
                ))}
              </ul>
              {doneList.length > 0 ? (
                <>
                  <div className="text-ink-faint my-2 flex items-center gap-2 text-[11px] tracking-wide uppercase">
                    <span>Completed</span>
                    <span className="bg-border h-px flex-1" />
                  </div>
                  <ul className="flex flex-col">
                    {doneList.map((t) => (
                      <Line key={t.viewKey} task={t} />
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}

          <div className="border-hairline mt-3 border-t pt-3">
            <AddTaskForm date={today} />
          </div>
        </>
      )}
    </section>
  );
}
