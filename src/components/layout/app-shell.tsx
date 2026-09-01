'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  Activity,
  CalendarDays,
  Home,
  Lightbulb,
  LogOut,
  MessagesSquare,
  Menu as MenuIcon,
  NotebookPen,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/brand/logo';
import { useListConversationsQuery, useMyInvitesQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import type { User } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/thoughts', label: 'Thoughts', icon: Lightbulb },
  { href: '/tasks', label: 'Tasks', icon: CalendarDays },
  { href: '/messages', label: 'Messages', icon: MessagesSquare },
  { href: '/journal', label: 'Journal', icon: NotebookPen },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/trash', label: 'Trash', icon: Trash2 },
] as const;

function initials(user: User): string {
  const base = user.name.trim() || user.username || user.email;
  return base.slice(0, 1).toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: convs } = useListConversationsQuery();
  const { data: invites } = useMyInvitesQuery();
  const unreadMessages = convs?.items.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const badgeFor = (href: string): number => {
    if (href === '/messages') return unreadMessages;
    if (href === '/thoughts') return invites?.length ?? 0;
    return 0;
  };

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const badge = badgeFor(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
              active
                ? 'bg-surface-2 text-ink font-medium'
                : 'text-ink-muted hover:bg-surface-2/70 hover:text-ink',
            )}
          >
            <span
              className={cn(
                'bg-accent absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full transition-opacity',
                active ? 'opacity-100' : 'opacity-0',
              )}
            />
            <Icon size={16} className={active ? 'text-accent' : undefined} />
            {label}
            {badge > 0 ? (
              <span className="bg-accent text-accent-fg ml-auto grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountFooter({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return (
    <div className="border-hairline mt-auto border-t pt-3">
      <div className="flex items-center gap-2.5 px-1.5 py-1">
        <span className="bg-accent/12 text-accent grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold">
          {initials(user)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="text-ink block truncate">{user.name || user.email}</span>
          {user.username ? (
            <span className="text-ink-faint block truncate text-[12px]">
              @{user.username}
            </span>
          ) : null}
        </span>
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="text-ink-faint hover:bg-surface-2 hover:text-danger shrink-0 rounded-lg p-1.5 transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between px-1.5">
        <span className="text-ink-faint text-[11px] tracking-wide uppercase">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      {/* desktop sidebar */}
      <aside className="border-hairline bg-surface/60 hidden w-60 shrink-0 flex-col border-r px-3 py-4 backdrop-blur-sm md:flex">
        <Link href="/home" className="px-2.5 pb-5">
          <Logo />
        </Link>
        <NavLinks />
        <AccountFooter user={user} onSignOut={onSignOut} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="border-hairline bg-surface/70 flex items-center gap-2 border-b px-3 py-2.5 backdrop-blur-sm md:hidden">
          <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Dialog.Trigger
              aria-label="Open menu"
              className="text-ink-muted hover:bg-surface-2 rounded-lg p-1.5"
            >
              <MenuIcon size={18} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'var(--backdrop)' }}
              />
              <Dialog.Content className="border-hairline bg-surface fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r px-3 py-4 shadow-2xl focus:outline-none">
                <div className="mb-5 flex items-center justify-between px-2.5">
                  <Logo />
                  <Dialog.Close
                    aria-label="Close menu"
                    className="text-ink-faint hover:bg-surface-2 hover:text-ink rounded-lg p-1"
                  >
                    <X size={16} />
                  </Dialog.Close>
                </div>
                <NavLinks onNavigate={() => setDrawerOpen(false)} />
                <AccountFooter user={user} onSignOut={onSignOut} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Link href="/home">
            <Logo markSize={22} textClassName="text-base" />
          </Link>
        </div>

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
