'use client';

import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Lightbulb, MessagesSquare, Users } from 'lucide-react';
import Link from 'next/link';

import { CenteredSpinner } from '@/components/ui/misc';
import { useListThoughtsQuery } from '@/lib/api/api';

export function RecentThoughts() {
  const { data, isLoading } = useListThoughtsQuery({
    sort: 'recent',
    status: 'active',
    limit: 3,
  });
  const items = data?.items ?? [];

  return (
    <section className="border-hairline bg-surface flex flex-col rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink flex items-center gap-2 font-serif text-[15px] font-semibold">
          <Lightbulb size={16} className="text-ink-faint" />
          Recent thoughts
        </h2>
        <Link
          href="/thoughts"
          className="text-ink-faint hover:text-ink inline-flex items-center gap-1 text-[12px]"
        >
          All thoughts <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : items.length === 0 ? (
        <p className="text-ink-faint py-6 text-center text-sm">
          You haven’t started a thought yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((t) => {
            const when = t.lastEntryAt ?? t.createdAt;
            return (
              <li key={t.id}>
                <Link
                  href={`/thoughts/${t.id}`}
                  className="hover:bg-surface-2/60 -mx-2 flex flex-col gap-0.5 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <span className="text-ink flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{t.title}</span>
                    {t.role === 'collaborator' ? (
                      <Users size={11} className="text-ink-faint shrink-0" />
                    ) : null}
                  </span>
                  <span className="text-ink-faint flex items-center gap-2 text-[12px]">
                    <span className="inline-flex items-center gap-1">
                      <MessagesSquare size={11} />
                      {t.entryCount}
                    </span>
                    <span>·</span>
                    <span>
                      {t.lastEntryAt ? 'updated' : 'created'}{' '}
                      {formatDistanceToNow(new Date(when), { addSuffix: true })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
