'use client';

import { KeyRound, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field, PasswordInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useResetVaultMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { useVault } from '@/lib/vault/vault-context';

export function VaultUnlock() {
  const { unlock } = useVault();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlock(pw);
    } catch (err) {
      setError(errorMessage(err, 'Wrong master password'));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader title="Vault" />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6">
          <div className="bg-accent/12 text-accent mb-4 grid size-10 place-items-center rounded-full">
            <LockKeyhole size={18} />
          </div>
          <h1 className="text-ink font-serif text-lg font-semibold">Vault locked</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Enter your master password to decrypt your credentials.
          </p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <Field label="Master password" error={error ?? undefined}>
              {({ id }) => (
                <PasswordInput
                  id={id}
                  autoFocus
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);
                    setError(null);
                  }}
                />
              )}
            </Field>
            <Button type="submit" className="w-full" loading={busy} disabled={!pw}>
              <KeyRound size={15} />
              {busy ? 'Unlocking…' : 'Unlock'}
            </Button>
          </form>

          <div className="border-hairline mt-4 border-t pt-3 text-center">
            <ForgotDialog />
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotDialog() {
  const toast = useToast();
  const [reset, { isLoading }] = useResetVaultMutation();
  const [confirmText, setConfirmText] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-ink-faint hover:text-ink text-[12px] underline-offset-2 hover:underline">
          Forgot your master password?
        </button>
      </DialogTrigger>
      <DialogContent
        title="Reset the vault"
        description="This permanently deletes your keystore and every saved credential. It cannot be undone."
        className="max-w-md"
      >
        <div className="flex flex-col gap-3">
          <p className="text-ink-muted text-sm">
            There is no recovery for a forgotten master password. Type{' '}
            <span className="text-ink font-semibold">DELETE</span> to wipe the vault and
            start over.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="border-hairline bg-field text-ink focus:border-accent/55 focus:ring-accent/20 h-10 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
          />
          <Button
            variant="danger"
            disabled={confirmText !== 'DELETE' || isLoading}
            loading={isLoading}
            onClick={async () => {
              try {
                await reset().unwrap();
                toast.info('Vault reset');
              } catch (err) {
                toast.error(errorMessage(err, 'Could not reset the vault'));
              }
            }}
          >
            Permanently delete the vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
