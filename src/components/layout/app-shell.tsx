'use client';

import { Activity, Lightbulb, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/cn';
import type { User } from '@/lib/types';

const NAV = [
  { href: '/thoughts', label: 'Thoughts', icon: Lightbulb },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

function initials(user: User): string {
  const base = user.name.trim() || user.email;
  return base.slice(0, 1).toUpperCase();
}

export function AppShell({
  user,
  onSignOut,
  children,
}: {
  user: User;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="border-border bg-surface hidden w-60 shrink-0 flex-col border-r px-3 py-4 md:flex">
        <div className="text-ink px-2.5 pb-4 text-[15px] font-semibold tracking-tight">
          Thoughts
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  active
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <Dropdown>
            <DropdownTrigger className="text-ink-muted hover:bg-surface-2 hover:text-ink flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus:outline-none">
              <span className="bg-accent-tint text-accent flex size-6 items-center justify-center rounded-full text-[11px] font-semibold">
                {initials(user)}
              </span>
              <span className="min-w-0 flex-1 truncate">{user.name || user.email}</span>
            </DropdownTrigger>
            <DropdownContent align="start">
              <div className="text-ink-faint px-2.5 py-1.5 text-xs">{user.email}</div>
              <DropdownItem danger icon={<LogOut size={15} />} onSelect={onSignOut}>
                Sign out
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
