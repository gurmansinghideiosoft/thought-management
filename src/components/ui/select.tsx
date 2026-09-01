'use client';

import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Thin wrapper over Radix Select — real keyboard navigation, type-ahead, and
 * origin-aware open animation. Values must be non-empty strings (Radix rule);
 * use a sentinel like `'all'` for an "all" option.
 */
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
  return (
    <RSelect.Root value={value} onValueChange={(v) => onValueChange(v as T)}>
      <RSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          'border-hairline bg-field text-ink focus-halo inline-flex h-10 items-center justify-between gap-2 rounded-lg border px-3 text-sm transition-colors',
          'hover:bg-surface-2 data-[placeholder]:text-ink-faint',
          className,
        )}
      >
        <RSelect.Value placeholder="Select…" />
        <RSelect.Icon asChild>
          <ChevronsUpDown size={14} className="text-ink-faint shrink-0" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="border-hairline bg-overlay shadow-popover animate-pop-in data-[state=closed]:animate-pop-out z-50 max-h-72 min-w-(--radix-select-trigger-width) origin-[var(--radix-select-content-transform-origin)] overflow-hidden rounded-xl border p-1"
        >
          <RSelect.Viewport>
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className="text-ink-muted data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink data-[state=checked]:text-ink flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none select-none"
              >
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check size={14} className="text-accent" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
