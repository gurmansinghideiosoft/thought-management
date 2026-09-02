'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCreateFinanceTagMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type { FinanceTag } from '@/lib/types';
import { useToast } from '@/components/ui/toast';

/** A tiny combobox: pick an existing finance tag, or type a name and create it
 * without leaving the row. `value` is a tag id or `null` (= no tag). */
export function TagCombobox({
  value,
  onChange,
  tags,
  className,
}: {
  value: string | null;
  onChange: (tagId: string | null) => void;
  tags: FinanceTag[];
  className?: string;
}) {
  const toast = useToast();
  const [createTag, { isLoading: creating }] = useCreateFinanceTagMutation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const selected = tags.find((t) => t.id === value) ?? null;
  const query = q.trim();
  const filtered = useMemo(
    () =>
      query
        ? tags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
        : tags,
    [tags, query],
  );
  const exact = tags.some((t) => t.name.toLowerCase() === query.toLowerCase());

  const create = async () => {
    if (!query || exact || creating) return;
    try {
      const tag = await createTag({ name: query }).unwrap();
      onChange(tag.id);
      setQ('');
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the tag'));
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'border-hairline bg-field text-ink focus-halo hover:bg-surface-2 inline-flex h-9 items-center justify-between gap-2 rounded-lg border px-2.5 text-[13px] transition-colors',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selected ? (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
          ) : null}
          <span className={cn('truncate', !selected && 'text-ink-faint')}>
            {selected ? selected.name : 'No tag'}
          </span>
        </span>
        <ChevronsUpDown size={13} className="text-ink-faint shrink-0" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="border-hairline bg-overlay shadow-popover animate-pop-in data-[state=closed]:animate-pop-out z-50 w-[var(--radix-popover-trigger-width)] min-w-52 [transform-origin:var(--radix-popover-content-transform-origin)] rounded-xl border p-1"
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void create())}
            placeholder="Search or create…"
            className="text-ink placeholder:text-ink-faint mb-1 w-full bg-transparent px-2 py-1.5 text-[13px] focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-ink-muted hover:bg-surface-2 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]"
            >
              No tag
              {value === null ? <Check size={13} className="text-accent" /> : null}
            </button>
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className="text-ink hover:bg-surface-2 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="truncate">{t.name}</span>
                </span>
                {t.id === value ? <Check size={13} className="text-accent" /> : null}
              </button>
            ))}
            {query && !exact ? (
              <button
                type="button"
                onClick={() => void create()}
                disabled={creating}
                className="text-accent hover:bg-surface-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13px] disabled:opacity-60"
              >
                <Plus size={13} />
                Create “{query}”
              </button>
            ) : null}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
