'use client';

import { Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useCreateFinanceTagMutation,
  useDeleteFinanceTagMutation,
  useListFinanceTagsQuery,
  useUpdateFinanceTagMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

const SWATCHES = ['#c96442', '#3f7d58', '#3b6ea5', '#8a5cf6', '#c2410c', '#6f6d65'];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="flex size-5 items-center justify-center rounded-full"
          style={{ backgroundColor: c }}
          aria-label={`Color ${c}`}
        >
          {value === c ? <Check size={11} className="text-white" /> : null}
        </button>
      ))}
    </div>
  );
}

export function FinanceTagManager({ trigger }: { trigger: React.ReactNode }) {
  const { data: tags, isLoading } = useListFinanceTagsQuery();
  const [createTag, { isLoading: creating }] = useCreateFinanceTagMutation();
  const [updateTag] = useUpdateFinanceTagMutation();
  const [deleteTag] = useDeleteFinanceTagMutation();
  const toast = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await createTag({ name: name.trim(), color }).unwrap();
      setName('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the tag'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Spending tags"
        description="Deleting a tag leaves its transactions untagged."
      >
        {isLoading ? (
          <CenteredSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {(tags ?? []).map((t) => (
                <TagRow
                  key={t.id}
                  name={t.name}
                  color={t.color}
                  onRename={(newName) => updateTag({ id: t.id, name: newName })}
                  onRecolor={(newColor) => updateTag({ id: t.id, color: newColor })}
                  onDelete={async () => {
                    try {
                      await deleteTag(t.id).unwrap();
                    } catch (err) {
                      toast.error(errorMessage(err, 'Could not delete the tag'));
                    }
                  }}
                />
              ))}
              {(tags ?? []).length === 0 ? (
                <p className="text-ink-faint py-2 text-center text-sm">No tags yet</p>
              ) : null}
            </div>

            <div className="border-hairline flex items-center gap-2 border-t pt-3">
              <ColorPicker value={color} onChange={setColor} />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="New tag name"
                className="h-9"
                maxLength={40}
              />
              <Button size="sm" className="h-9" onClick={add} loading={creating}>
                <Plus size={15} />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TagRow({
  name,
  color,
  onRename,
  onRecolor,
  onDelete,
}: {
  name: string;
  color: string;
  onRename: (name: string) => void;
  onRecolor: (color: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(name);
  const dirty = draft.trim() !== name && draft.trim().length > 0;

  return (
    <div className="border-hairline bg-surface flex items-center gap-2 rounded-lg border px-2 py-1.5">
      <ColorPicker value={color} onChange={onRecolor} />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => dirty && onRename(draft.trim())}
        onKeyDown={(e) => e.key === 'Enter' && dirty && onRename(draft.trim())}
        className="text-ink min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
      />
      {dirty ? (
        <IconButton label="Save name" onClick={() => onRename(draft.trim())}>
          <Check size={14} />
        </IconButton>
      ) : null}
      <IconButton label={`Delete ${name}`} onClick={onDelete}>
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}
