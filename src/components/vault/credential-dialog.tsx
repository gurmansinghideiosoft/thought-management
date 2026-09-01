'use client';

import { Eye, EyeOff, Lock, LockOpen, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { PasswordGenerator } from '@/components/vault/password-generator';
import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCreateCredentialMutation, useUpdateCredentialMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type {
  CredentialCategory,
  CredentialField,
  CredentialMeta,
  CredentialPayload,
} from '@/lib/types';
import { useVault } from '@/lib/vault/vault-context';

const CATEGORIES: { value: CredentialCategory; label: string }[] = [
  { value: 'login', label: 'Login' },
  { value: 'api', label: 'API / keys' },
  { value: 'note', label: 'Secure note' },
  { value: 'other', label: 'Other' },
];

const PRESET_FIELDS: Record<CredentialCategory, CredentialField[]> = {
  login: [
    { label: 'Username', value: '', secret: false },
    { label: 'Password', value: '', secret: true },
  ],
  api: [
    { label: 'API key', value: '', secret: true },
    { label: 'Secret', value: '', secret: true },
  ],
  note: [],
  other: [{ label: 'Value', value: '', secret: true }],
};

export function CredentialDialog({
  mode,
  credential,
  initialPayload,
  trigger,
}: {
  mode: 'create' | 'edit';
  credential?: CredentialMeta;
  initialPayload?: CredentialPayload;
  trigger: React.ReactNode;
}) {
  const toast = useToast();
  const { seal } = useVault();
  const [create, { isLoading: creating }] = useCreateCredentialMutation();
  const [update, { isLoading: updating }] = useUpdateCredentialMutation();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(credential?.name ?? '');
  const [category, setCategory] = useState<CredentialCategory>(
    credential?.category ?? 'login',
  );
  const [tags, setTags] = useState<string[]>(credential?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [fields, setFields] = useState<CredentialField[]>(
    () =>
      initialPayload?.fields.map((f) => ({ ...f })) ??
      PRESET_FIELDS[credential?.category ?? 'login'].map((f) => ({ ...f })),
  );
  const [notes, setNotes] = useState(initialPayload?.notes ?? '');

  const allEmpty = fields.every((f) => !f.value.trim() && !f.label.trim());

  const pickCategory = (c: CredentialCategory) => {
    setCategory(c);
    // Only swap in the preset when nothing has been entered yet.
    if (mode === 'create' && allEmpty) setFields(PRESET_FIELDS[c].map((f) => ({ ...f })));
  };

  const setField = (i: number, patch: Partial<CredentialField>) =>
    setFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]);
    setTagDraft('');
  };

  const save = async () => {
    if (!name.trim()) return;
    const payload: CredentialPayload = {
      fields: fields
        .map((f) => ({ ...f, label: f.label.trim(), value: f.value }))
        .filter((f) => f.label || f.value),
      notes: notes.trim(),
    };
    try {
      const cipher = await seal(payload);
      if (mode === 'create') {
        await create({ name: name.trim(), category, tags, cipher }).unwrap();
        toast.success('Saved');
      } else if (credential) {
        await update({
          id: credential.id,
          name: name.trim(),
          category,
          tags,
          cipher,
        }).unwrap();
        toast.success('Updated');
      }
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title={mode === 'create' ? 'New credential' : 'Edit credential'}
        className="max-w-lg"
      >
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <Field label="Name">
            {({ id }) => (
              <Input
                id={id}
                autoFocus
                placeholder="GitHub, AWS, Stripe…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
              />
            )}
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[13px] font-medium">Category</span>
            <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => pickCategory(c.value)}
                  className={cn(
                    'h-8 flex-1 rounded-md text-[12px] transition-colors',
                    category === c.value
                      ? 'bg-surface-2 text-ink font-medium'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-ink-muted text-[13px] font-medium">Fields</span>
            {fields.map((f, i) => (
              <FieldRow
                key={i}
                field={f}
                onChange={(patch) => setField(i, patch)}
                onRemove={() => setFields((rows) => rows.filter((_, idx) => idx !== i))}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                setFields((f) => [...f, { label: '', value: '', secret: true }])
              }
              className="border-hairline text-ink-muted hover:text-ink inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed px-2.5 py-1.5 text-[12px]"
            >
              <Plus size={13} /> Add field
            </button>
          </div>

          <Field label="Notes">
            {({ id }) => (
              <Textarea
                id={id}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Recovery codes, security questions, anything else."
              />
            )}
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[13px] font-medium">Tags</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="border-hairline text-ink-muted inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="add a tag"
                className="text-ink placeholder:text-ink-faint min-w-[6rem] flex-1 bg-transparent text-[12px] focus:outline-none"
              />
            </div>
          </div>

          <Button
            className="mt-1"
            onClick={save}
            loading={creating || updating}
            disabled={!name.trim()}
          >
            {mode === 'create' ? 'Save credential' : 'Save changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  field,
  onChange,
  onRemove,
}: {
  field: CredentialField;
  onChange: (patch: Partial<CredentialField>) => void;
  onRemove: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const masked = field.secret && !reveal;

  return (
    <div className="border-hairline bg-surface flex flex-col gap-1.5 rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Label"
          className="text-ink placeholder:text-ink-faint min-w-0 flex-1 bg-transparent text-[12px] font-medium focus:outline-none"
        />
        <IconButton
          label={field.secret ? 'Mark not secret' : 'Mark secret'}
          className="size-6"
          onClick={() => onChange({ secret: !field.secret })}
        >
          {field.secret ? <Lock size={12} /> : <LockOpen size={12} />}
        </IconButton>
        <IconButton label="Remove field" className="size-6" onClick={onRemove}>
          <X size={12} />
        </IconButton>
      </div>
      <div className="flex items-center gap-1">
        <input
          type={masked ? 'password' : 'text'}
          value={field.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Value"
          autoComplete="off"
          className="border-hairline bg-field text-ink focus:border-accent/55 focus:ring-accent/20 h-8 min-w-0 flex-1 rounded-md border px-2 font-mono text-[12px] focus:ring-2 focus:outline-none"
        />
        {field.secret ? (
          <IconButton
            label={reveal ? 'Hide' : 'Reveal'}
            className="size-8"
            onClick={() => setReveal((r) => !r)}
          >
            {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
          </IconButton>
        ) : null}
        <PasswordGenerator onPick={(v) => onChange({ value: v })} />
      </div>
    </div>
  );
}
