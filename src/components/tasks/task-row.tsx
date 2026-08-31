'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { TagPill } from '@/components/tags/tag-pill';
import { IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useDeleteTaskMutation,
  useSetTaskStatusMutation,
  useUpdateTaskMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { PRIORITIES, PRIORITY_LABELS, type Priority } from '@/lib/priority';
import type { Task, TaskTag } from '@/lib/types';
import { PriorityDot } from './priority';

export function TaskRow({ task, tags }: { task: Task; tags: TaskTag[] }) {
  const toast = useToast();
  const [setStatus] = useSetTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.content);
  // Optimistic target for the checkbox. Ignored once the server value matches it.
  const [pendingStatus, setPendingStatus] = useState<Task['status'] | null>(null);

  const status =
    pendingStatus && pendingStatus !== task.status ? pendingStatus : task.status;
  const done = status === 'done';

  const attached = tags.filter((t) => task.tagIds.includes(t.id));
  const available = tags.filter((t) => !task.tagIds.includes(t.id));

  const toggle = async () => {
    const next = done ? 'pending' : 'done';
    setPendingStatus(next);
    try {
      await setStatus({ id: task.id, status: next }).unwrap();
    } catch (err) {
      setPendingStatus(null);
      toast.error(errorMessage(err, 'Could not update the task'));
    }
  };

  const saveEdit = async () => {
    if (!draft.trim()) return;
    try {
      await updateTask({ id: task.id, content: draft.trim() }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const setPriority = (p: Priority) => updateTask({ id: task.id, priority: p });
  const setTags = (tagIds: string[]) => updateTask({ id: task.id, tagIds });

  return (
    <div className="group hover:bg-surface-2/60 flex items-start gap-2.5 rounded-lg px-2 py-1.5">
      <button
        onClick={toggle}
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
          done
            ? 'border-accent bg-accent text-accent-fg'
            : 'border-hairline hover:border-accent',
        )}
        aria-label={done ? 'Mark pending' : 'Mark done'}
      >
        {done ? <Check size={11} strokeWidth={3} /> : null}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="text-ink w-full bg-transparent text-sm focus:outline-none"
          />
        ) : (
          <p
            className={cn(
              'text-sm leading-snug',
              done ? 'text-ink-faint line-through' : 'text-ink',
            )}
          >
            {task.content}
          </p>
        )}

        {attached.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {attached.map((t) => (
              <TagPill
                key={t.id}
                name={t.name}
                color={t.color}
                onRemove={() => setTags(task.tagIds.filter((id) => id !== t.id))}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <span title={PRIORITY_LABELS[(task.priority as Priority) ?? 3]}>
          <PriorityDot priority={task.priority} className="mt-1.5" />
        </span>

        {available.length > 0 ? (
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconButton label="Add tag" className="opacity-0 group-hover:opacity-100">
                <Plus size={14} />
              </IconButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={6}
                className="border-hairline bg-surface z-50 w-44 rounded-xl border p-1 shadow-lg shadow-black/[0.08]"
              >
                {available.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTags([...task.tagIds, t.id])}
                    className="text-ink hover:bg-surface-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : null}

        <Dropdown>
          <DropdownTrigger asChild>
            <IconButton
              label="Task actions"
              className="opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={14} />
            </IconButton>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem
              icon={<Pencil size={15} />}
              onSelect={() => {
                setDraft(task.content);
                setEditing(true);
              }}
            >
              Edit text
            </DropdownItem>
            <div className="text-ink-faint px-2.5 py-1 text-[11px] tracking-wide uppercase">
              Priority
            </div>
            {PRIORITIES.map((p) => (
              <DropdownItem
                key={p}
                icon={<PriorityDot priority={p} />}
                onSelect={() => void setPriority(p)}
              >
                {PRIORITY_LABELS[p]}
              </DropdownItem>
            ))}
            <DropdownItem
              danger
              icon={<Trash2 size={15} />}
              onSelect={() => void deleteTask(task.id)}
            >
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
}
