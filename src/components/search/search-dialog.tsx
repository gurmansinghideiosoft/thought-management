'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  CalendarDays,
  FileText,
  Inbox,
  Lightbulb,
  type LucideIcon,
  NotebookPen,
  Search,
  Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Spinner } from '@/components/ui/misc';
import { useSearchQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { fromDateKey } from '@/lib/date';
import { highlightMatches } from '@/lib/highlight';
import { useDebounced } from '@/lib/use-debounced';

interface Row {
  key: string;
  group: string;
  icon: LucideIcon;
  title: string;
  snippet: string;
  meta: string;
  href: string;
}

const prettyDate = (d: string): string =>
  fromDateKey(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="animate-overlay-in data-[state=closed]:animate-overlay-out fixed inset-0 z-50 backdrop-blur-[2px]"
          style={{ backgroundColor: 'var(--backdrop)' }}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="animate-dialog-in data-[state=closed]:animate-dialog-out border-hairline bg-overlay shadow-modal fixed top-[11vh] left-1/2 z-50 flex max-h-[74vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border focus:outline-none"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          {open ? <Body onClose={() => onOpenChange(false)} /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounced(q.trim(), 220);
  const ready = debounced.length >= 2;
  const { data, isFetching } = useSearchQuery(debounced, { skip: !ready });

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const g = data.groups;
    return [
      ...g.thoughts.map((t) => ({
        key: `t${t.id}`,
        group: 'Thoughts',
        icon: Lightbulb,
        title: t.title,
        snippet: t.snippet,
        meta: '',
        href: `/thoughts/${t.id}`,
      })),
      ...g.entries.map((e) => ({
        key: `e${e.id}`,
        group: 'Entries',
        icon: FileText,
        title: e.thoughtTitle,
        snippet: e.snippet,
        meta: e.kind,
        href: `/thoughts/${e.thoughtId}`,
      })),
      ...g.journal.map((j) => ({
        key: `j${j.id}`,
        group: 'Journal',
        icon: NotebookPen,
        title: j.title || prettyDate(j.date),
        snippet: j.snippet,
        meta: prettyDate(j.date),
        href: `/journal/${j.id}`,
      })),
      ...g.tasks.map((t) => ({
        key: `k${t.id}`,
        group: 'Tasks',
        icon: CalendarDays,
        title: t.content,
        snippet: '',
        meta: [t.date ? prettyDate(t.date) : null, t.status].filter(Boolean).join(' · '),
        href: '/tasks',
      })),
      ...g.transactions.map((t) => ({
        key: `x${t.id}`,
        group: 'Finance',
        icon: Wallet,
        title: t.title,
        snippet: '',
        meta: prettyDate(t.date),
        href: '/finance',
      })),
      ...g.captures.map((c) => ({
        key: `c${c.id}`,
        group: 'Inbox',
        icon: Inbox,
        title: c.text,
        snippet: '',
        meta: '',
        href: '/inbox',
      })),
    ];
  }, [data]);

  const activeIdx = rows.length === 0 ? 0 : Math.min(active, rows.length - 1);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${activeIdx}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const go = (row: Row) => {
    router.push(row.href);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && rows[activeIdx]) {
      e.preventDefault();
      go(rows[activeIdx]);
    }
  };

  return (
    <>
      <div className="border-hairline flex items-center gap-2.5 border-b px-4">
        <Search size={16} className="text-ink-faint shrink-0" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search thoughts, tasks, journal, money…"
          className="text-ink placeholder:text-ink-faint h-12 min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
        />
        {isFetching ? <Spinner className="shrink-0" /> : null}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {!ready ? (
          <p className="text-ink-faint px-3 py-6 text-center text-[13px]">
            Type at least two letters to search everything at once.
          </p>
        ) : rows.length === 0 && !isFetching ? (
          <p className="text-ink-faint px-3 py-6 text-center text-[13px]">
            Nothing found for “{debounced}”.
          </p>
        ) : (
          rows.map((row, idx) => {
            const first = idx === 0 || rows[idx - 1]!.group !== row.group;
            const Icon = row.icon;
            return (
              <div key={row.key}>
                {first ? (
                  <p className="text-ink-faint px-2.5 pt-2.5 pb-1 text-[10px] font-medium tracking-wide uppercase">
                    {row.group}
                  </p>
                ) : null}
                <button
                  type="button"
                  data-idx={idx}
                  onMouseMove={() => setActive(idx)}
                  onClick={() => go(row)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left',
                    idx === activeIdx ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                  )}
                >
                  <Icon size={15} className="text-ink-faint mt-0.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="text-ink flex items-center gap-2 text-[13px]">
                      <span className="truncate">
                        {highlightMatches(row.title, debounced)}
                      </span>
                      {row.meta ? (
                        <span className="text-ink-faint shrink-0 text-[11px] capitalize">
                          {row.meta}
                        </span>
                      ) : null}
                    </span>
                    {row.snippet ? (
                      <span className="text-ink-muted mt-0.5 block truncate text-[12px]">
                        {highlightMatches(row.snippet, debounced)}
                      </span>
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
