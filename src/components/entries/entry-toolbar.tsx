'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ListFilter, Search, Star, X } from 'lucide-react';

import { IconButton } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { TagWithCount } from '@/lib/types';

export interface TimelineFilterState {
  tagId?: string;
  starred?: boolean;
  kind?: 'note' | 'link' | 'file';
}

export function EntryToolbar({
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
  const activeCount =
    (value.tagId ? 1 : 0) + (value.starred ? 1 : 0) + (value.kind ? 1 : 0);

  const rowCls =
    'text-ink hover:bg-surface-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]';

  return (
    <div className="flex items-center gap-1.5">
      <div className="border-hairline bg-field focus-within:border-accent/55 flex items-center gap-1.5 rounded-full border px-2.5 py-1">
        <Search size={12} className="text-ink-faint shrink-0" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          className="text-ink placeholder:text-ink-faint w-20 min-w-0 bg-transparent text-[12px] focus:outline-none sm:w-36"
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

      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton
            label="Filter entries"
            className={cn('relative', activeCount > 0 && 'text-accent')}
          >
            <ListFilter size={16} />
            {activeCount > 0 ? (
              <span className="bg-accent absolute top-1 right-1 size-1.5 rounded-full" />
            ) : null}
          </IconButton>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            className="border-hairline bg-overlay shadow-popover animate-pop-in data-[state=closed]:animate-pop-out z-50 w-56 origin-[var(--radix-popover-content-transform-origin)] rounded-xl border p-1.5"
          >
            <button
              type="button"
              onClick={() =>
                onChange({ ...value, starred: value.starred ? undefined : true })
              }
              className={rowCls}
            >
              <Star
                size={14}
                className={cn('shrink-0', value.starred && 'fill-star text-star')}
              />
              <span className="flex-1">Starred</span>
              {value.starred ? <Check size={14} className="text-accent" /> : null}
            </button>

            {tags.length > 0 ? (
              <>
                <div className="bg-hairline my-1 h-px" />
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        tagId: value.tagId === t.id ? undefined : t.id,
                      })
                    }
                    className={rowCls}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: t.color ?? 'var(--color-ink-faint)' }}
                    />
                    <span className="flex-1 truncate">{t.name}</span>
                    <span className="text-ink-faint text-[11px] tabular-nums">
                      {t.entryCount}
                    </span>
                    {value.tagId === t.id ? (
                      <Check size={14} className="text-accent" />
                    ) : null}
                  </button>
                ))}
              </>
            ) : null}

            {activeCount > 0 ? (
              <>
                <div className="bg-hairline my-1 h-px" />
                <button
                  type="button"
                  onClick={() => onChange({})}
                  className="text-ink-muted hover:bg-surface-2 flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[13px]"
                >
                  Clear filters
                </button>
              </>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
