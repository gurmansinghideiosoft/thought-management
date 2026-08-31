'use client';

import { formatDistanceToNow } from 'date-fns';
import { Archive, MessagesSquare } from 'lucide-react';
import Link from 'next/link';

import { TagPill } from '@/components/tags/tag-pill';
import type { Thought } from '@/lib/types';

export function ThoughtCard({ thought }: { thought: Thought }) {
  const when = thought.lastEntryAt ?? thought.createdAt;

  return (
    <Link
      href={`/thoughts/${thought.id}`}
      className="group border-border bg-surface hover:border-border-strong hover:bg-surface-2/40 block rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-ink group-hover:text-ink font-medium">{thought.title}</h3>
        {thought.status === 'archived' ? (
          <Archive size={14} className="text-ink-faint mt-1 shrink-0" />
        ) : null}
      </div>

      {thought.description ? (
        <p className="text-ink-muted mt-1 line-clamp-2 text-[13.5px] leading-relaxed">
          {thought.description}
        </p>
      ) : null}

      {thought.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {thought.tags.slice(0, 4).map((t) => (
            <TagPill key={t.id} name={t.name} color={t.color} />
          ))}
        </div>
      ) : null}

      <div className="text-ink-faint mt-3 flex items-center gap-3 text-[12px]">
        <span className="inline-flex items-center gap-1">
          <MessagesSquare size={13} />
          {thought.entryCount}
        </span>
        <span>·</span>
        <span>
          {thought.lastEntryAt ? 'updated' : 'created'}{' '}
          {formatDistanceToNow(new Date(when), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
