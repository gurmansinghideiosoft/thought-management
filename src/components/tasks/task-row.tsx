'use client';

import * as Popover from '@radix-ui/react-popover';
import {
  CalendarRange,
  MoreHorizontal,
  Pencil,
  Plus,
  Repeat,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { TagPill } from '@/components/tags/tag-pill';
import { IconButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useDeleteTaskMutation,
  useSetVirtualTaskStatusMutation,
  useUpdateTaskMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { PRIORITIES, PRIORITY_LABELS, type Priority } from '@/lib/priority';
import { useTaskToggle } from '@/lib/tasks/use-task-toggle';
import type { TaskTag, TaskView } from '@/lib/types';
import { PriorityDot } from './priority';

export function TaskRow({ task, tags }: { task: TaskView; tags: TaskTag[] }) {
  const toast = useToast();
  const toggleTask = useTaskToggle();
  const [setVirtualStatus] = useSetVirtualTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.content);
  // Optimistic target for the checkbox. Ignored once the server value matches it.
  const [pendingStatus, setPendingStatus] = useState<TaskView['status'] | null>(null);

  const status =
    pendingStatus && pendingStatus !== task.status ? pendingStatus : task.status;
  const done = status === 'done';

  const attached = tags.filter((t) => task.tagIds.includes(t.id));
  const available = tags.filter((t) => !task.tagIds.includes(t.id));

  const isRoutine = task.routineItemId != null;
  const isRange = task.kind === 'range' || task.rangeTaskId != null;
  const sourceLink = task.routineItemId
    ? { routineItemId: task.routineItemId }
    : task.rangeTaskId
      ? { rangeTaskId: task.rangeTaskId }
      : null;
  // A virtual occurrence has no stored row yet — it must be materialized before
  // it can carry an edit.
  const canSkip = task.virtual && sourceLink !== null;

  /** Ensure a real row exists for this day; resolves to its id. */
  const materialize = async (): Promise<string> => {
    if (!task.virtual || !sourceLink) return task.id;
    const row = await setVirtualStatus({
      date: task.day,
      status: task.status,
      ...sourceLink,
    }).unwrap();
    return row.id;
  };

  const toggle = async () => {
    const next = done ? 'pending' : 'done';
    setPendingStatus(next);
    try {
      await toggleTask(task, next);
    } catch {
      setPendingStatus(null);
    }
  };

  const skipToday = async () => {
    if (!sourceLink) return;
    try {
      await setVirtualStatus({
        date: task.day,
        status: 'skipped',
        ...sourceLink,
      }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not skip the task'));
    }
  };

  const saveEdit = async () => {
    const next = draft.trim();
    if (!next || next === task.content) {
      setEditing(false);
      return;
    }
    try {
      const id = await materialize();
      await updateTask({ id, content: next }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const setPriority = async (p: Priority) => {
    try {
      const id = await materialize();
      await updateTask({ id, priority: p }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change priority'));
    }
  };

  const setTags = async (tagIds: string[]) => {
    try {
      const id = await materialize();
      await updateTask({ id, tagIds }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change tags'));
    }
  };

  return (
    <div className="group hover:bg-surface-2/60 flex items-start gap-2.5 rounded-lg px-2 py-1.5">
      <Checkbox
        checked={done}
        onCheckedChange={() => void toggle()}
        aria-label={done ? 'Mark pending' : 'Mark done'}
        className="mt-0.5"
      />

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
              'flex items-center gap-1.5 text-sm leading-snug',
              done ? 'text-ink-faint line-through' : 'text-ink',
            )}
          >
            {isRoutine ? (
              <Repeat
                size={12}
                className="text-ink-faint shrink-0"
                aria-label="Routine"
              />
            ) : isRange ? (
              <CalendarRange
                size={12}
                className="text-ink-faint shrink-0"
                aria-label="Range task"
              />
            ) : null}
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
              <IconButton
                label="Add tag"
                className="opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
              >
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
              className="opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
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
            {canSkip ? (
              <DropdownItem
                icon={<SkipForward size={15} />}
                onSelect={() => void skipToday()}
              >
                Skip today
              </DropdownItem>
            ) : null}
            {!task.virtual ? (
              <DropdownItem
                danger
                icon={<Trash2 size={15} />}
                onSelect={() => void deleteTask(task.id)}
              >
                Delete
              </DropdownItem>
            ) : null}
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
}
