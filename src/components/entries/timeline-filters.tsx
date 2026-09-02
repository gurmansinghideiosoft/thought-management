'use client';

import { Search, Star, X } from 'lucide-react';

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
  query,
  onQueryChange,
}: {
  tags: TagWithCount[];
  value: TimelineFilterState;
  onChange: (next: TimelineFilterState) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const set = (patch: TimelineFilterState) => onChange({ ...value, ...patch });
  const active = value.tagId || value.starred || value.kind || query.trim();

  return (
    <div className="border-hairline bg-paper/70 flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5">
      <div className="border-hairline bg-surface focus-within:border-accent/55 flex items-center gap-1.5 rounded-full border px-2.5 py-1">
        <Search size={12} className="text-ink-faint shrink-0" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search entries"
          className="text-ink placeholder:text-ink-faint w-28 min-w-0 bg-transparent text-[12px] focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="text-ink-faint hover:text-ink -mr-1 shrink-0"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>

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
          onClick={() => {
            onChange({});
            onQueryChange('');
          }}
          className="text-ink-faint hover:text-ink ml-1 text-[12px] underline-offset-2 hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
