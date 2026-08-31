'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';

import { cn } from '@/lib/cn';

export const Dropdown = RadixMenu.Root;
export const DropdownTrigger = RadixMenu.Trigger;

export function DropdownContent({
  children,
  align = 'end',
}: {
  children: React.ReactNode;
  align?: 'start' | 'end';
}) {
  return (
    <RadixMenu.Portal>
      <RadixMenu.Content
        align={align}
        sideOffset={6}
        className="border-hairline bg-overlay z-50 min-w-48 rounded-xl border p-1 shadow-xl shadow-black/15 focus:outline-none"
      >
        {children}
      </RadixMenu.Content>
    </RadixMenu.Portal>
  );
}

export function DropdownItem({
  children,
  onSelect,
  danger,
  icon,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <RadixMenu.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none',
        'data-[highlighted]:bg-surface-2',
        danger ? 'text-danger' : 'text-ink',
      )}
    >
      {icon ? <span className="text-ink-faint shrink-0">{icon}</span> : null}
      {children}
    </RadixMenu.Item>
  );
}

export const DropdownSeparator = () => (
  <RadixMenu.Separator className="bg-hairline my-1 h-px" />
);
