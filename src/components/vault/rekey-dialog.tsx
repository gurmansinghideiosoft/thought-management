'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, PasswordInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api/baseQuery';
import { useVault } from '@/lib/vault/vault-context';

export function RekeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { rekey } = useVault();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = current && next.length >= 10 && confirm === next && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await rekey(current, next);
      toast.success('Master password changed');
      onOpenChange(false);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(errorMessage(err, 'Could not change the master password'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Change master password"
        description="Your credentials are re-wrapped under the new password. They aren't re-encrypted, so this is quick."
        className="max-w-sm"
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Current master password" error={error ?? undefined}>
            {({ id }) => (
              <PasswordInput
                id={id}
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            )}
          </Field>
          <Field
            label="New master password"
            error={next && next.length < 10 ? 'Use at least 10 characters' : undefined}
          >
            {({ id }) => (
              <PasswordInput
                id={id}
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            )}
          </Field>
          <Field
            label="Confirm new password"
            error={confirm && confirm !== next ? 'Doesn’t match' : undefined}
          >
            {({ id }) => (
              <PasswordInput
                id={id}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            )}
          </Field>
          <Button type="submit" loading={busy} disabled={!canSubmit}>
            Change password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
