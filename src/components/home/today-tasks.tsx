'use client';

import { ArrowRight, Check, ListTodo } from 'lucide-react';
import Link from 'next/link';

import { PriorityDot } from '@/components/tasks/priority';
import { CenteredSpinner } from '@/components/ui/misc';
import { useListTasksQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import type { TaskView } from '@/lib/types';

function TaskLine({ task }: { task: TaskView }) {
  const done = task.status === 'done';
  return (
    <li className="flex items-start gap-2.5 py-1">
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] border',
          done ? 'border-accent bg-accent text-accent-fg' : 'border-hairline',
        )}
      >
        {done ? <Check size={11} strokeWidth={3} /> : null}
      </span>
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
}

export function TodayTasks() {
  const today = toDateKey(new Date());
  const { data, isLoading } = useListTasksQuery({ from: today, to: today });

  const items = (data?.items ?? []).filter((t) => t.day === today);
  const pending = items.filter((t) => t.status === 'pending');
  const done = items.filter((t) => t.status === 'done');

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
        <CenteredSpinner />
      ) : items.length === 0 ? (
        <p className="text-ink-faint py-6 text-center text-sm">
          Nothing scheduled for today.
        </p>
      ) : (
        <>
          <p className="text-ink-muted mb-1.5 text-[12px]">
            {done.length} done · {pending.length} to go
          </p>
          <ul className="flex flex-col">
            {pending.map((t) => (
              <TaskLine key={t.viewKey} task={t} />
            ))}
          </ul>
          {done.length > 0 ? (
            <>
              <div className="text-ink-faint my-2 flex items-center gap-2 text-[11px] tracking-wide uppercase">
                <span>Completed</span>
                <span className="bg-border h-px flex-1" />
              </div>
              <ul className="flex flex-col">
                {done.map((t) => (
                  <TaskLine key={t.viewKey} task={t} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
