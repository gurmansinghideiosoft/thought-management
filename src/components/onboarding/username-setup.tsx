'use client';

import { AtSign } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useUpdateMeMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

const VALID = /^[a-z0-9_]{3,30}$/;

/**
 * Shown once to accounts that predate usernames. Blocks the app until a handle
 * is set — chat and sharing need one.
 */
export function UsernameSetup({ suggestion }: { suggestion?: string }) {
  const toast = useToast();
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [value, setValue] = useState(suggestion ?? '');

  const normalized = value.trim().toLowerCase();
  const valid = VALID.test(normalized);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await updateMe({ username: normalized }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not set your username'));
    }
  };

  return (
    <div className="bg-paper flex min-h-full flex-1 items-center justify-center p-6">
      <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6">
        <div className="bg-accent/12 text-accent mb-4 grid size-10 place-items-center rounded-full">
          <AtSign size={18} />
        </div>
        <h1 className="text-ink font-serif text-lg font-semibold">Pick a username</h1>
        <p className="text-ink-muted mt-1 text-sm">
          It’s how teammates find you when sharing a thought or starting a chat. You can
          change it later.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
          <Field
            label="Username"
            error={value && !valid ? '3–30 letters, digits or underscores' : undefined}
          >
            {({ id }) => (
              <Input
                id={id}
                autoFocus
                autoComplete="username"
                placeholder="jane_doe"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
          </Field>
          <Button type="submit" className="w-full" loading={isLoading} disabled={!valid}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
