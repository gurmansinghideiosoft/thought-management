'use client';

import { formatDistanceToNow } from 'date-fns';
import { Archive, MessagesSquare, Users } from 'lucide-react';
import Link from 'next/link';

import { TagPill } from '@/components/tags/tag-pill';
import type { Thought } from '@/lib/types';

export function ThoughtCard({ thought }: { thought: Thought }) {
  const when = thought.lastEntryAt ?? thought.createdAt;

  return (
    <Link
      href={`/thoughts/${thought.id}`}
      className="group border-hairline bg-surface hover:border-ink-faint/40 flex h-full flex-col rounded-xl border p-4 shadow-[0_1px_2px_rgba(26,23,18,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(26,23,18,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-ink font-serif text-[15px] leading-snug font-semibold">
          {thought.title}
        </h3>
        <div className="mt-1 flex shrink-0 items-center gap-1.5">
          {thought.role === 'collaborator' ? (
            <span
              className="border-hairline text-ink-faint inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
              title={
                thought.sharedBy?.username
                  ? `Shared by @${thought.sharedBy.username}`
                  : 'Shared with you'
              }
            >
              <Users size={10} />
              Shared
            </span>
          ) : null}
          {thought.status === 'archived' ? (
            <Archive size={13} className="text-ink-faint" />
          ) : null}
        </div>
      </div>

      {thought.description ? (
        <p className="text-ink-muted mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed">
          {thought.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      {thought.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {thought.tags.slice(0, 3).map((t) => (
            <TagPill key={t.id} name={t.name} color={t.color} />
          ))}
          {thought.tags.length > 3 ? (
            <span className="text-ink-faint text-[11px]">+{thought.tags.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <div className="border-hairline text-ink-faint mt-3 flex items-center gap-2 border-t pt-2.5 text-[11.5px]">
        <span className="inline-flex items-center gap-1">
          <MessagesSquare size={12} />
          {thought.entryCount}
        </span>
        <span>·</span>
        <span className="truncate">
          {thought.lastEntryAt ? 'updated' : 'created'}{' '}
          {formatDistanceToNow(new Date(when), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
