'use client';

import { formatDistanceToNow } from 'date-fns';
import { Check, Copy, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CredentialDialog } from '@/components/vault/credential-dialog';
import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useDeleteCredentialMutation, useGetCredentialQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { CredentialMeta, CredentialPayload } from '@/lib/types';
import { useVault } from '@/lib/vault/vault-context';

export function CredentialDetail({
  credential,
  trigger,
}: {
  credential: CredentialMeta;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={credential.name} className="max-w-lg">
        {open ? <Body credential={credential} onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  credential,
  onClose,
}: {
  credential: CredentialMeta;
  onClose: () => void;
}) {
  const toast = useToast();
  const { open: decrypt } = useVault();
  const { data, isLoading } = useGetCredentialQuery(credential.id);
  const [remove, { isLoading: removing }] = useDeleteCredentialMutation();
  const [payload, setPayload] = useState<CredentialPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!data) return;
    let live = true;
    decrypt<CredentialPayload>(data.cipher)
      .then((p) => live && setPayload(p))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [data, decrypt]);

  if (isLoading || (!payload && !failed)) return <CenteredSpinner />;
  if (failed) {
    return (
      <p className="text-danger py-6 text-center text-sm">
        Could not decrypt this credential.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-ink-faint flex items-center gap-2 text-[12px]">
        <span className="capitalize">{credential.category}</span>
        {credential.tags.map((t) => (
          <span key={t} className="border-hairline rounded-full border px-1.5">
            {t}
          </span>
        ))}
        <span className="ml-auto">
          updated{' '}
          {formatDistanceToNow(new Date(credential.updatedAt), { addSuffix: true })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {payload?.fields.length === 0 ? (
          <p className="text-ink-faint text-sm">No fields.</p>
        ) : null}
        {payload?.fields.map((f, i) => (
          <ValueRow key={i} label={f.label} value={f.value} secret={f.secret} />
        ))}
      </div>

      {payload?.notes ? (
        <div>
          <p className="text-ink-faint mb-1 text-[11px] tracking-wide uppercase">Notes</p>
          <p className="text-ink-muted text-[13px] leading-relaxed whitespace-pre-wrap">
            {payload.notes}
          </p>
        </div>
      ) : null}

      <div className="border-hairline flex items-center justify-end gap-2 border-t pt-3">
        <Button
          size="sm"
          variant="danger"
          loading={removing}
          onClick={async () => {
            try {
              await remove(credential.id).unwrap();
              toast.info('Deleted');
              onClose();
            } catch (err) {
              toast.error(errorMessage(err, 'Could not delete'));
            }
          }}
        >
          <Trash2 size={14} />
          Delete
        </Button>
        {payload ? (
          <CredentialDialog
            mode="edit"
            credential={credential}
            initialPayload={payload}
            trigger={
              <Button size="sm" variant="secondary">
                <Pencil size={14} />
                Edit
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}

function ValueRow({
  label,
  value,
  secret,
}: {
  label: string;
  value: string;
  secret: boolean;
}) {
  const toast = useToast();
  const [reveal, setReveal] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Clipboard unavailable');
    }
  };

  return (
    <div className="border-hairline bg-surface flex items-center gap-2 rounded-lg border px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-ink-faint text-[11px]">{label}</p>
        <p className="text-ink truncate font-mono text-[13px]">
          {reveal ? value || '—' : '••••••••••'}
        </p>
      </div>
      {secret ? (
        <IconButton
          label={reveal ? 'Hide' : 'Reveal'}
          className="size-7"
          onClick={() => setReveal((r) => !r)}
        >
          {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
        </IconButton>
      ) : null}
      <IconButton label="Copy" className="size-7" onClick={copy}>
        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      </IconButton>
    </div>
  );
}
