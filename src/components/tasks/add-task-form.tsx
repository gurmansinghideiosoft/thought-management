'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useCreateTaskMutation, useListTaskTagsQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type { Priority } from '@/lib/priority';
import { PrioritySelect } from './priority';

export function AddTaskForm({
  date,
  autoFocus,
  onAdded,
}: {
  date: string;
  autoFocus?: boolean;
  onAdded?: () => void;
}) {
  const toast = useToast();
  const { data: tags } = useListTaskTagsQuery();
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(3);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createTask({
        content: content.trim(),
        date,
        priority,
        tagIds: tagIds.length ? tagIds : undefined,
      }).unwrap();
      setContent('');
      setTagIds([]);
      onAdded?.();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the task'));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          value={content}
          autoFocus={autoFocus}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a task…"
          maxLength={500}
          className="border-border-strong bg-surface text-ink placeholder:text-ink-faint focus:border-accent/50 focus:ring-accent/20 h-9 flex-1 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
        />
        <PrioritySelect value={priority} onChange={setPriority} />
        <Button type="submit" size="sm" className="h-9" loading={isLoading}>
          <Plus size={15} />
        </Button>
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
                  setTagIds(on ? tagIds.filter((id) => id !== t.id) : [...tagIds, t.id])
                }
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-none transition-colors',
                  on
                    ? 'border-accent/40 bg-accent-tint text-accent'
                    : 'border-border-strong bg-surface text-ink-faint hover:text-ink',
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
    </form>
  );
}
