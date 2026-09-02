'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  useCreateTaskMutation,
  useCreateThoughtMutation,
  useDeleteCaptureMutation,
  useUpdateCaptureMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import type { Capture } from '@/lib/types';

const URL_RE = /^https?:\/\/[^\s]+$/i;

/** Split a dump into a short title (first line) and the remaining body. */
function titleAndBody(text: string): { title: string; body: string } {
  const lines = text.split('\n');
  const title = lines[0].trim().slice(0, 200) || 'Untitled';
  const body = lines.slice(1).join('\n').trim();
  return { title, body };
}

export function CaptureItem({ capture }: { capture: Capture }) {
  const toast = useToast();
  const [update, { isLoading: updating }] = useUpdateCaptureMutation();
  const [remove] = useDeleteCaptureMutation();
  const [createTask] = useCreateTaskMutation();
  const [createThought] = useCreateThoughtMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(capture.text);
  const [busy, setBusy] = useState(false);

  const archived = capture.status === 'archived';
  const isLink = URL_RE.test(capture.text.trim());

  const saveEdit = async () => {
    const value = draft.trim();
    if (!value || value === capture.text) return setEditing(false);
    try {
      await update({ id: capture.id, text: value }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const setStatus = (status: 'open' | 'archived') =>
    update({ id: capture.id, status })
      .unwrap()
      .catch(() => toast.error('Could not update'));

  const toTask = async () => {
    setBusy(true);
    try {
      await createTask({
        content: titleAndBody(capture.text).title,
        date: toDateKey(new Date()),
        priority: 3,
      }).unwrap();
      await update({ id: capture.id, status: 'archived' }).unwrap();
      toast.success("Added to today's tasks");
    } catch (err) {
      toast.error(errorMessage(err, 'Could not make a task'));
    } finally {
      setBusy(false);
    }
  };

  const toThought = async () => {
    setBusy(true);
    try {
      const { title, body } = titleAndBody(capture.text);
      await createThought({ title, description: body || undefined }).unwrap();
      await update({ id: capture.id, status: 'archived' }).unwrap();
      toast.success('Turned into a thought');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not make a thought'));
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="border-hairline bg-surface flex flex-col gap-2 rounded-xl border p-3">
        <Textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void saveEdit();
            }
            if (e.key === 'Escape') setEditing(false);
          }}
          className="min-h-[4.5rem] resize-y text-sm leading-relaxed"
        />
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(capture.text);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={() => void saveEdit()} loading={updating}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group border-hairline bg-surface rounded-xl border p-3.5',
        archived && 'opacity-70',
        busy && 'pointer-events-none opacity-50',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isLink ? (
            <a
              href={capture.text.trim()}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-sm break-all hover:underline"
            >
              {capture.text.trim()}
            </a>
          ) : (
            <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
              {capture.text}
            </p>
          )}
        </div>
        <Dropdown>
          <DropdownTrigger asChild>
            <IconButton
              label="Actions"
              className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
            >
              <MoreHorizontal size={15} />
            </IconButton>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem icon={<Pencil size={14} />} onSelect={() => setEditing(true)}>
              Edit
            </DropdownItem>
            {archived ? (
              <DropdownItem
                icon={<ArchiveRestore size={14} />}
                onSelect={() => void setStatus('open')}
              >
                Move back to inbox
              </DropdownItem>
            ) : (
              <DropdownItem
                icon={<Archive size={14} />}
                onSelect={() => void setStatus('archived')}
              >
                Archive
              </DropdownItem>
            )}
            <DropdownSeparator />
            <DropdownItem
              danger
              icon={<Trash2 size={14} />}
              onSelect={() =>
                remove(capture.id)
                  .unwrap()
                  .catch(() => toast.error('Could not delete'))
              }
            >
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-ink-faint text-[12px]">
          {formatDistanceToNow(new Date(capture.createdAt), { addSuffix: true })}
        </span>
        {!archived ? (
          <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100">
            <button
              type="button"
              onClick={() => void toTask()}
              className="text-ink-muted hover:bg-surface-2 hover:text-ink inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px]"
            >
              <CalendarPlus size={13} />
              Task
            </button>
            <button
              type="button"
              onClick={() => void toThought()}
              className="text-ink-muted hover:bg-surface-2 hover:text-ink inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px]"
            >
              <Lightbulb size={13} />
              Thought
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
