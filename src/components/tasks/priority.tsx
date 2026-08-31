'use client';

import * as RadixSelect from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import {
  isPriority,
  PRIORITIES,
  PRIORITY_COLOR,
  PRIORITY_LABELS,
  type Priority,
} from '@/lib/priority';

export function PriorityDot({
  priority,
  className,
}: {
  priority: number;
  className?: string;
}) {
  const p: Priority = isPriority(priority) ? priority : 3;
  return (
    <span
      className={cn('inline-block size-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: PRIORITY_COLOR[p] }}
      title={PRIORITY_LABELS[p]}
    />
  );
}

export function PrioritySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (p: Priority) => void;
}) {
  const [open, setOpen] = useState(false);
  const p: Priority = isPriority(value) ? value : 3;

  return (
    <RadixSelect.Root open={open} onOpenChange={setOpen}>
      <RadixSelect.Trigger className="border-border-strong bg-surface text-ink-muted inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm focus:outline-none">
        <PriorityDot priority={p} />
        <span className="hidden sm:inline">{PRIORITY_LABELS[p]}</span>
        <ChevronDown size={13} className="text-ink-faint" />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          align="start"
          sideOffset={6}
          className="border-border bg-surface z-50 w-52 rounded-xl border p-1 shadow-lg shadow-black/[0.08]"
        >
          {PRIORITIES.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="text-ink hover:bg-surface-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm"
            >
              <PriorityDot priority={option} />
              <span className="flex-1">{PRIORITY_LABELS[option]}</span>
              {option === p ? <Check size={14} className="text-accent" /> : null}
            </button>
          ))}
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
