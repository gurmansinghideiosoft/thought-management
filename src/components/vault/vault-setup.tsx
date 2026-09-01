'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Field, PasswordInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api/baseQuery';
import { useVault } from '@/lib/vault/vault-context';

export function VaultSetup() {
  const { setup } = useVault();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);

  const tooShort = pw.length > 0 && pw.length < 10;
  const mismatch = confirm.length > 0 && confirm !== pw;
  const canSubmit = pw.length >= 10 && confirm === pw && ack && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      await setup(pw);
      toast.success('Vault created');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the vault'));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader title="Vault" />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="border-hairline bg-surface w-full max-w-md rounded-2xl border p-6">
          <div className="bg-accent/12 text-accent mb-4 grid size-10 place-items-center rounded-full">
            <ShieldCheck size={18} />
          </div>
          <h1 className="text-ink font-serif text-lg font-semibold">Create your vault</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Your master password encrypts every credential in your browser. The server
            only ever stores unreadable ciphertext.
          </p>

          <div className="border-danger/40 bg-danger/8 mt-4 flex gap-2.5 rounded-lg border p-3">
            <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
            <p className="text-ink text-[13px] leading-relaxed">
              There is <span className="font-semibold">no way to recover</span> this
              password. If you forget it, everything in the vault is lost for good.
            </p>
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <Field
              label="Master password"
              error={tooShort ? 'Use at least 10 characters' : undefined}
              hint="Make it long and memorable — a passphrase works well."
            >
              {({ id }) => (
                <PasswordInput
                  id={id}
                  autoFocus
                  autoComplete="new-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
              )}
            </Field>
            <Field
              label="Confirm master password"
              error={mismatch ? 'Passwords don’t match' : undefined}
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
            <label className="text-ink-muted flex items-start gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="accent-accent mt-0.5 size-3.5"
              />
              I understand that losing this password means losing my saved credentials.
            </label>
            <Button type="submit" className="w-full" loading={busy} disabled={!canSubmit}>
              {busy ? 'Encrypting…' : 'Create vault'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
