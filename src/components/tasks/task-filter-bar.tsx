'use client';

import { TagPill } from '@/components/tags/tag-pill';
import { useListTaskTagsQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { PRIORITIES, PRIORITY_COLOR, PRIORITY_SHORT } from '@/lib/priority';

export interface TaskFilters {
  tagIds: string[];
  priorities: number[];
}

export function TaskFilterBar({
  value,
  onChange,
}: {
  value: TaskFilters;
  onChange: (next: TaskFilters) => void;
}) {
  const { data: tags } = useListTaskTagsQuery();

  const togglePriority = (p: number) =>
    onChange({
      ...value,
      priorities: value.priorities.includes(p)
        ? value.priorities.filter((x) => x !== p)
        : [...value.priorities, p],
    });

  const toggleTag = (id: string) =>
    onChange({
      ...value,
      tagIds: value.tagIds.includes(id)
        ? value.tagIds.filter((x) => x !== id)
        : [...value.tagIds, id],
    });

  const dirty = value.tagIds.length > 0 || value.priorities.length > 0;

  return (
    <div className="border-hairline bg-paper/70 flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5">
      {PRIORITIES.map((p) => {
        const active = value.priorities.includes(p);
        return (
          <button
            key={p}
            onClick={() => togglePriority(p)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors',
              active
                ? 'border-ink/20 bg-surface-2 text-ink'
                : 'border-hairline bg-surface text-ink-muted hover:text-ink',
            )}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLOR[p] }}
            />
            {PRIORITY_SHORT[p]}
          </button>
        );
      })}

      {(tags ?? []).length > 0 ? <span className="bg-hairline mx-1 h-4 w-px" /> : null}

      {(tags ?? []).map((t) => (
        <TagPill
          key={t.id}
          name={t.name}
          color={t.color}
          active={value.tagIds.includes(t.id)}
          onClick={() => toggleTag(t.id)}
        />
      ))}

      {dirty ? (
        <button
          onClick={() => onChange({ tagIds: [], priorities: [] })}
          className="text-ink-faint hover:text-ink ml-1 text-[12px] underline-offset-2 hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
