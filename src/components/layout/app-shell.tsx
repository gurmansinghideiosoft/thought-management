'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  Activity,
  CalendarDays,
  Home,
  Inbox,
  KeyRound,
  Lightbulb,
  ListChecks,
  ListTodo,
  LogOut,
  MessagesSquare,
  Menu as MenuIcon,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Telescope,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/brand/logo';
import { QuickCaptureDialog } from '@/components/capture/quick-capture';
import { QuickLogDialog } from '@/components/home/quick-log-dialog';
import { QuickTaskDialog } from '@/components/home/quick-task-dialog';
import { SearchDialog } from '@/components/search/search-dialog';
import {
  useListCapturesQuery,
  useListConversationsQuery,
  useMyInvitesQuery,
} from '@/lib/api/api';
import { cn } from '@/lib/cn';
import type { User } from '@/lib/types';
import { initials } from '@/lib/user';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/thoughts', label: 'Thoughts', icon: Lightbulb },
  { href: '/tasks', label: 'Tasks', icon: CalendarDays },
  { href: '/messages', label: 'Messages', icon: MessagesSquare },
  { href: '/journal', label: 'Journal', icon: NotebookPen },
  { href: '/review', label: 'Review', icon: Telescope },
  { href: '/habits', label: 'Habits', icon: ListChecks },
  { href: '/finance', label: 'Finance', icon: Wallet },
  { href: '/vault', label: 'Vault', icon: KeyRound },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/trash', label: 'Trash', icon: Trash2 },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: convs } = useListConversationsQuery();
  const { data: invites } = useMyInvitesQuery();
  const { data: captures } = useListCapturesQuery('open');
  const unreadMessages = convs?.items.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const badgeFor = (href: string): number => {
    if (href === '/messages') return unreadMessages;
    if (href === '/thoughts') return invites?.length ?? 0;
    if (href === '/inbox') return captures?.length ?? 0;
    return 0;
  };

  const activeHref = NAV.find(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  )?.href;

  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const el = nav?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`);
      setPill(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeHref]);

  return (
    <nav ref={navRef} className="relative flex flex-col gap-0.5">
      {pill ? (
        <span
          aria-hidden
          className="bg-surface-2 ease-ios absolute inset-x-0 top-0 rounded-lg transition-[transform,height] duration-200 motion-reduce:transition-none"
          style={{ transform: `translateY(${pill.top}px)`, height: pill.height }}
        >
          <span className="bg-accent absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full" />
        </span>
      ) : null}
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === activeHref;
        const badge = badgeFor(href);
        return (
          <Link
            key={href}
            href={href}
            data-href={href}
            onClick={onNavigate}
            className={cn(
              'relative z-10 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
              active
                ? 'text-ink font-medium'
                : 'text-ink-muted hover:bg-surface-2/50 hover:text-ink',
            )}
          >
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

interface QuickAction {
  icon: typeof Plus;
  label: string;
  hint: string;
  onSelect: () => void;
}

/** A single compact row of icon buttons for the global quick actions. Each
 * button's tooltip carries its keyboard shortcut, so the shortcuts stay
 * discoverable without four labelled rows crowding the sidebar. */
function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="border-hairline mb-3 grid grid-cols-4 gap-0.5 rounded-xl border p-1">
      {actions.map(({ icon: Icon, label, hint, onSelect }) => (
        <button
          key={label}
          type="button"
          onClick={onSelect}
          aria-label={`${label} (${hint})`}
          title={`${label}  ·  ${hint}`}
          className="text-ink-faint hover:bg-surface-2 hover:text-ink focus-halo flex h-8 items-center justify-center rounded-lg transition-colors"
        >
          <Icon size={16} />
        </button>
      ))}
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
  const [captureOpen, setCaptureOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  useEffect(() => {
    // Bare single-key shortcuts, ignored while a dialog is open or the caret is
    // in a field — mirrors the `c` quick-capture binding.
    const bareKeys: Record<string, (v: boolean) => void> = {
      c: setCaptureOpen,
      l: setLogOpen,
      t: setTaskOpen,
    };

    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — global search, from anywhere.
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const open = bareKeys[e.key.toLowerCase()];
      if (!open) return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))
        return;
      e.preventDefault();
      open(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    // Cap the shell at the viewport and let only <main> scroll, so the sidebar
    // and mobile bar never move with the page.
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <QuickCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickLogDialog open={logOpen} onOpenChange={setLogOpen} />
      <QuickTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />

      {/* desktop sidebar */}
      <aside className="border-hairline bg-surface/60 hidden w-60 shrink-0 flex-col overflow-y-auto border-r px-3 py-4 backdrop-blur-sm md:flex">
        <Link href="/home" className="px-2.5 pb-4">
          <Logo />
        </Link>
        <QuickActions
          actions={[
            {
              icon: Search,
              label: 'Search',
              hint: '⌘K',
              onSelect: () => setSearchOpen(true),
            },
            {
              icon: Plus,
              label: 'Quick capture',
              hint: 'C',
              onSelect: () => setCaptureOpen(true),
            },
            {
              icon: NotebookPen,
              label: 'Log something',
              hint: 'L',
              onSelect: () => setLogOpen(true),
            },
            {
              icon: ListTodo,
              label: 'Add a task',
              hint: 'T',
              onSelect: () => setTaskOpen(true),
            },
          ]}
        />
        <NavLinks />
        <AccountFooter user={user} onSignOut={onSignOut} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="border-hairline bg-surface/70 flex shrink-0 items-center gap-2 border-b px-3 py-2.5 backdrop-blur-sm md:hidden">
          <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Dialog.Trigger
              aria-label="Open menu"
              className="text-ink-muted hover:bg-surface-2 rounded-lg p-1.5"
            >
              <MenuIcon size={18} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className="animate-overlay-in data-[state=closed]:animate-overlay-out fixed inset-0 z-40 backdrop-blur-[2px]"
                style={{ backgroundColor: 'var(--backdrop)' }}
              />
              <Dialog.Content className="border-hairline bg-surface shadow-modal animate-drawer-in data-[state=closed]:animate-drawer-out fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r px-3 py-4 focus:outline-none">
                <div className="mb-5 flex items-center justify-between px-2.5">
                  <Logo />
                  <Dialog.Close
                    aria-label="Close menu"
                    className="text-ink-faint hover:bg-surface-2 hover:text-ink rounded-lg p-1"
                  >
                    <X size={16} />
                  </Dialog.Close>
                </div>
                <QuickActions
                  actions={[
                    {
                      icon: Search,
                      label: 'Search',
                      hint: '⌘K',
                      onSelect: () => {
                        setDrawerOpen(false);
                        setSearchOpen(true);
                      },
                    },
                    {
                      icon: Plus,
                      label: 'Quick capture',
                      hint: 'C',
                      onSelect: () => {
                        setDrawerOpen(false);
                        setCaptureOpen(true);
                      },
                    },
                    {
                      icon: NotebookPen,
                      label: 'Log something',
                      hint: 'L',
                      onSelect: () => {
                        setDrawerOpen(false);
                        setLogOpen(true);
                      },
                    },
                    {
                      icon: ListTodo,
                      label: 'Add a task',
                      hint: 'T',
                      onSelect: () => {
                        setDrawerOpen(false);
                        setTaskOpen(true);
                      },
                    },
                  ]}
                />
                <NavLinks onNavigate={() => setDrawerOpen(false)} />
                <AccountFooter user={user} onSignOut={onSignOut} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Link href="/home">
            <Logo markSize={22} textClassName="text-base" />
          </Link>
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
