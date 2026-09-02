'use client';

import { AlignLeft, Pencil, Tag as TagIcon } from 'lucide-react';
import { useState } from 'react';

import { TagManager } from '@/components/tags/tag-manager';
import { Button, IconButton } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useUpdateThoughtMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { Thought } from '@/lib/types';

/** The thought's description + tags, rendered as a pinned entry-style card so
 * the timeline reads consistently. Editing is inline (owner only). */
export function ThoughtOverviewCard({ thought }: { thought: Thought }) {
  const toast = useToast();
  const [update, { isLoading }] = useUpdateThoughtMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thought.description);

  const isCollaborator = thought.role === 'collaborator';

  if (
    isCollaborator &&
    !thought.description &&
    thought.tags.length === 0 &&
    !thought.sharedBy
  ) {
    return null;
  }

  const save = async () => {
    try {
      await update({ id: thought.id, description: draft }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  return (
    <div className="group border-hairline border-l-accent/40 bg-surface relative rounded-xl border border-l-2 p-4">
      <div className="text-ink-faint mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
        <AlignLeft size={12} />
        Overview
        {!isCollaborator && !editing ? (
          <IconButton
            label="Edit overview"
            className="ml-auto size-6 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
            onClick={() => {
              setDraft(thought.description);
              setEditing(true);
            }}
          >
            <Pencil size={13} />
          </IconButton>
        ) : null}
      </div>

      {thought.sharedBy ? (
        <p className="text-ink-faint mb-1.5 text-[12px]">
          Shared by{' '}
          {thought.sharedBy.username
            ? `@${thought.sharedBy.username}`
            : thought.sharedBy.name || 'the owner'}
        </p>
      ) : null}

      {editing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft(thought.description);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" loading={isLoading} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      ) : thought.description ? (
        <p className="text-ink text-[14.5px] leading-relaxed whitespace-pre-wrap">
          {thought.description}
        </p>
      ) : !isCollaborator ? (
        <button
          type="button"
          onClick={() => {
            setDraft('');
            setEditing(true);
          }}
          className="text-ink-faint hover:text-ink text-[13.5px]"
        >
          Add a one-line overview…
        </button>
      ) : null}

      {thought.tags.length > 0 || !isCollaborator ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {isCollaborator ? (
            thought.tags.map((t) => (
              <span
                key={t.id}
                className="border-hairline text-ink-faint inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: t.color ?? 'var(--color-ink-faint)' }}
                />
                {t.name}
              </span>
            ))
          ) : (
            <TagManager
              thoughtId={thought.id}
              trigger={
                <Button size="sm" variant="ghost" className="-ml-2 h-7">
                  <TagIcon size={13} />
                  {thought.tags.length > 0
                    ? `${thought.tags.length} ${thought.tags.length === 1 ? 'tag' : 'tags'}`
                    : 'Add tags'}
                </Button>
              }
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
