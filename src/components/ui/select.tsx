'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={ariaLabel}
        className={cn(
          'border-hairline bg-field text-ink inline-flex h-10 items-center justify-between gap-2 rounded-lg border px-3 text-sm transition-colors',
          'hover:bg-surface-2 focus-visible:ring-accent/25 focus:outline-none focus-visible:ring-2',
          className,
        )}
      >
        <span className="truncate">{current?.label ?? 'Select…'}</span>
        <ChevronsUpDown size={14} className="text-ink-faint shrink-0" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="border-hairline bg-overlay z-50 max-h-72 min-w-[--radix-popover-trigger-width] overflow-y-auto rounded-xl border p-1 shadow-xl shadow-black/15 focus:outline-none"
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onValueChange(o.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm',
                o.value === value
                  ? 'bg-surface-2 text-ink'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              {o.label}
              {o.value === value ? <Check size={14} className="text-accent" /> : null}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
