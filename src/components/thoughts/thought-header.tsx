'use client';

import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Tag as TagIcon,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { TagManager } from '@/components/tags/tag-manager';
import { ShareDialog } from '@/components/thoughts/share-dialog';
import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  useDeleteThoughtMutation,
  useSetThoughtArchivedMutation,
  useUpdateThoughtMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { Thought } from '@/lib/types';

export function ThoughtHeader({ thought }: { thought: Thought }) {
  const router = useRouter();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(thought.title);
  const [description, setDescription] = useState(thought.description);

  const [updateThought, { isLoading: saving }] = useUpdateThoughtMutation();
  const [setArchived] = useSetThoughtArchivedMutation();
  const [deleteThought] = useDeleteThoughtMutation();

  const saveEdits = async () => {
    try {
      await updateThought({ id: thought.id, title: title.trim(), description }).unwrap();
      setEditOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const archived = thought.status === 'archived';
  const isCollaborator = thought.role === 'collaborator';
  const shareRole = isCollaborator ? 'collaborator' : 'owner';

  const shareButton = (
    <ShareDialog
      thoughtId={thought.id}
      role={shareRole}
      trigger={
        <IconButton label="Share this thought">
          <UserPlus size={17} />
        </IconButton>
      }
    />
  );

  return (
    <>
      <PageHeader
        title={thought.title}
        subtitle={`${thought.entryCount} ${thought.entryCount === 1 ? 'entry' : 'entries'}`}
        backHref="/thoughts"
        actions={
          <div className="flex items-center gap-1">
            {shareButton}
            {isCollaborator ? null : (
              <Dropdown>
                <DropdownTrigger asChild>
                  <IconButton label="Thought actions">
                    <MoreHorizontal size={18} />
                  </IconButton>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem
                    icon={<Pencil size={15} />}
                    onSelect={() => {
                      setTitle(thought.title);
                      setDescription(thought.description);
                      setEditOpen(true);
                    }}
                  >
                    Edit details
                  </DropdownItem>
                  <DropdownItem
                    icon={archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    onSelect={() => setArchived({ id: thought.id, archived: !archived })}
                  >
                    {archived ? 'Unarchive' : 'Archive'}
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem
                    danger
                    icon={<Trash2 size={15} />}
                    onSelect={async () => {
                      try {
                        await deleteThought(thought.id).unwrap();
                        toast.info('Moved to trash');
                        router.push('/thoughts');
                      } catch (err) {
                        toast.error(errorMessage(err, 'Could not delete'));
                      }
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            )}
          </div>
        }
      />

      <div className="border-hairline bg-paper/60 border-b">
        <div className="reading-column px-4 py-3">
          {isCollaborator && thought.sharedBy ? (
            <p className="text-ink-faint mb-1.5 text-[12px]">
              Shared by{' '}
              {thought.sharedBy.username
                ? `@${thought.sharedBy.username}`
                : thought.sharedBy.name || 'the owner'}
            </p>
          ) : null}
          {thought.description ? (
            <p className="text-ink-muted text-[13.5px] leading-relaxed whitespace-pre-wrap">
              {thought.description}
            </p>
          ) : null}
          <div className={thought.description ? 'mt-2' : undefined}>
            {isCollaborator ? (
              thought.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {thought.tags.map((t) => (
                    <span
                      key={t.id}
                      className="border-hairline text-ink-faint inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: t.color ?? 'var(--ink-faint)' }}
                      />
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : null
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
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent title="Edit thought">
          <div className="flex flex-col gap-4">
            <Field label="Title">
              {({ id }) => (
                <Input
                  id={id}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              )}
            </Field>
            <Field label="Description">
              {({ id }) => (
                <Textarea
                  id={id}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              )}
            </Field>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                loading={saving}
                onClick={saveEdits}
                disabled={!title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
