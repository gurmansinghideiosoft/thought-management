'use client';

import { Star } from 'lucide-react';

import { TagPill } from '@/components/tags/tag-pill';
import { cn } from '@/lib/cn';
import type { TagWithCount } from '@/lib/types';

export interface TimelineFilterState {
  tagId?: string;
  starred?: boolean;
  kind?: 'note' | 'link' | 'file';
}

export function TimelineFilters({
  tags,
  value,
  onChange,
}: {
  tags: TagWithCount[];
  value: TimelineFilterState;
  onChange: (next: TimelineFilterState) => void;
}) {
  const set = (patch: TimelineFilterState) => onChange({ ...value, ...patch });
  const active = value.tagId || value.starred || value.kind;

  return (
    <div className="border-hairline bg-paper/70 flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5">
      <button
        onClick={() => set({ starred: value.starred ? undefined : true })}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors',
          value.starred
            ? 'border-star/40 bg-star/10 text-star'
            : 'border-hairline bg-surface text-ink-muted hover:text-ink',
        )}
      >
        <Star size={12} className={cn(value.starred && 'fill-star')} />
        Starred
      </button>

      {tags.map((t) => (
        <TagPill
          key={t.id}
          name={t.name}
          color={t.color}
          count={t.entryCount}
          active={value.tagId === t.id}
          onClick={() => set({ tagId: value.tagId === t.id ? undefined : t.id })}
        />
      ))}

      {active ? (
        <button
          onClick={() => onChange({})}
          className="text-ink-faint hover:text-ink ml-1 text-[12px] underline-offset-2 hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
