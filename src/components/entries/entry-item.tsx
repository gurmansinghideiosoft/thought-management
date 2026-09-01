'use client';

import * as Popover from '@radix-ui/react-popover';
import {
  Download,
  FileText,
  ImageIcon,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { TagPill } from '@/components/tags/tag-pill';
import { Button, IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  useAttachEntryTagMutation,
  useDeleteEntryMutation,
  useDetachEntryTagMutation,
  useLazyGetEntryQuery,
  useSetEntryStarredMutation,
  useUpdateEntryMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { clockTime, fileSize } from '@/lib/format';
import type { Entry, Tag } from '@/lib/types';

export function EntryItem({
  entry,
  thoughtId,
  tags,
  readOnly = false,
}: {
  entry: Entry;
  thoughtId: string;
  tags: Tag[];
  readOnly?: boolean;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.body);

  const [setStarred] = useSetEntryStarredMutation();
  const [updateEntry, { isLoading: saving }] = useUpdateEntryMutation();
  const [deleteEntry] = useDeleteEntryMutation();
  const [attachTag] = useAttachEntryTagMutation();
  const [detachTag] = useDetachEntryTagMutation();
  const [fetchEntry, { isFetching: fetchingUrl }] = useLazyGetEntryQuery();

  const attached = tags.filter((t) => entry.tagIds.includes(t.id));
  const available = tags.filter((t) => !entry.tagIds.includes(t.id));

  const save = async () => {
    try {
      await updateEntry({ thoughtId, entryId: entry.id, body: draft }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const remove = async () => {
    try {
      await deleteEntry({ thoughtId, entryId: entry.id }).unwrap();
      toast.info('Entry deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete'));
    }
  };

  const download = async () => {
    try {
      const fresh = await fetchEntry({ thoughtId, entryId: entry.id }).unwrap();
      if (fresh.downloadUrl) window.open(fresh.downloadUrl, '_blank', 'noopener');
      else toast.error('No file to download');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not get the file'));
    }
  };

  return (
    <div className="group border-hairline bg-surface relative rounded-xl border px-4 py-3">
      <div className="text-ink-faint mb-1 flex items-center gap-2 text-[12px]">
        <span>{clockTime(entry.createdAt)}</span>
        {entry.kind !== 'note' ? (
          <span className="inline-flex items-center gap-1 capitalize">
            · {entry.kind === 'link' ? <Link2 size={12} /> : null}
            {entry.kind}
          </span>
        ) : null}

        {readOnly ? null : (
          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 data-[open=true]:opacity-100 pointer-coarse:opacity-100">
            <IconButton
              label={entry.starred ? 'Unstar' : 'Star'}
              onClick={() =>
                setStarred({ thoughtId, entryId: entry.id, starred: !entry.starred })
              }
            >
              <Star size={15} className={cn(entry.starred && 'fill-star text-star')} />
            </IconButton>
            <Dropdown>
              <DropdownTrigger asChild>
                <IconButton label="More">
                  <MoreHorizontal size={15} />
                </IconButton>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem
                  icon={<Pencil size={15} />}
                  onSelect={() => {
                    setDraft(entry.body);
                    setEditing(true);
                  }}
                >
                  Edit text
                </DropdownItem>
                <DropdownItem danger icon={<Trash2 size={15} />} onSelect={remove}>
                  Delete
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        )}
        {entry.starred ? (
          <Star
            size={13}
            className="fill-star text-star opacity-100 transition-opacity group-hover:opacity-0"
          />
        ) : null}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          {entry.body ? (
            <p className="text-ink text-[14.5px] leading-relaxed whitespace-pre-wrap">
              {entry.body}
            </p>
          ) : null}

          {entry.kind === 'link' && entry.link ? (
            <a
              href={entry.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-hairline bg-surface-2/60 hover:bg-surface-2 mt-2 flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors"
            >
              <Link2 size={15} className="text-ink-faint shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                <span className="text-ink block truncate font-medium">
                  {entry.link.title || entry.link.url}
                </span>
                <span className="text-ink-faint block truncate text-[12px]">
                  {entry.link.url}
                </span>
              </span>
            </a>
          ) : null}

          {entry.kind === 'file' && entry.file ? (
            <div className="border-hairline bg-surface-2/60 mt-2 flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm">
              {entry.file.category === 'image' ? (
                <ImageIcon size={15} className="text-ink-faint shrink-0" />
              ) : (
                <FileText size={15} className="text-ink-faint shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">
                <span className="text-ink block truncate font-medium">
                  {entry.file.originalName}
                </span>
                <span className="text-ink-faint text-[12px]">
                  {fileSize(entry.file.size)}
                </span>
              </span>
              <IconButton label="Download" onClick={download} disabled={fetchingUrl}>
                <Download size={14} />
              </IconButton>
            </div>
          ) : null}
        </>
      )}

      <div
        className="mt-2 flex flex-wrap items-center gap-1.5"
        hidden={readOnly && attached.length === 0}
      >
        {attached.map((t) => (
          <TagPill
            key={t.id}
            name={t.name}
            color={t.color}
            onRemove={
              readOnly
                ? undefined
                : () => detachTag({ thoughtId, entryId: entry.id, tagId: t.id })
            }
          />
        ))}
        {!readOnly && available.length > 0 ? (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="border-hairline text-ink-faint hover:text-ink inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-1 text-[12px] leading-none transition-colors">
                <Plus size={11} /> tag
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={6}
                align="start"
                className="border-hairline bg-surface z-50 w-48 rounded-xl border p-1 shadow-lg shadow-black/[0.08]"
              >
                {available.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      attachTag({ thoughtId, entryId: entry.id, tagId: t.id })
                    }
                    className="text-ink hover:bg-surface-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: t.color ?? 'var(--color-ink-faint)' }}
                    />
                    {t.name}
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : null}
      </div>
    </div>
  );
}
