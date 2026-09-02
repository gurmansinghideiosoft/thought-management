'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Card } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useCheckUsernameQuery, useUpdateMeMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { User } from '@/lib/types';
import { useDebounced } from '@/lib/use-debounced';
import { initials } from '@/lib/user';

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

const schema = z.object({
  name: z.string().trim().max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, '3–30 letters, digits or underscores'),
});
type Values = z.infer<typeof schema>;

export function ProfileCard({ user }: { user: User }) {
  const toast = useToast();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: { name: user.name, username: user.username ?? '' },
  });

  const rawUsername = useWatch({ control, name: 'username' }) ?? '';
  const wanted = useDebounced(rawUsername.trim().toLowerCase(), 400);
  const changed = wanted !== (user.username ?? '');
  const formatOk = USERNAME_RE.test(wanted);

  const { data: check, isFetching: checking } = useCheckUsernameQuery(wanted, {
    skip: !formatOk || !changed,
  });
  const resolved = !checking && check?.username === wanted ? check : undefined;
  const taken = changed && resolved?.available === false;

  const usernameStatus =
    !changed || errors.username || !formatOk ? undefined : checking || !resolved ? (
      <span className="text-ink-faint inline-flex items-center gap-1.5">
        <Loader2 size={13} className="animate-spin" /> Checking…
      </span>
    ) : resolved.available ? (
      <span className="text-success inline-flex items-center gap-1.5">
        <Check size={13} /> @{wanted} is available
      </span>
    ) : (
      <span className="text-danger inline-flex items-center gap-1.5">
        <X size={13} /> @{wanted} is taken
      </span>
    );

  const onSubmit = async (values: Values) => {
    if (taken) {
      toast.error('That username is taken — try another.');
      return;
    }
    const patch: { name?: string; username?: string } = {};
    if (dirtyFields.name) patch.name = values.name.trim();
    if (dirtyFields.username && changed) {
      patch.username = values.username.trim().toLowerCase();
    }
    if (Object.keys(patch).length === 0) return;

    try {
      const res = await updateMe(patch).unwrap();
      reset({ name: res.user.name, username: res.user.username ?? '' });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your profile'));
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <span className="bg-accent/12 text-accent grid size-16 shrink-0 place-items-center rounded-full font-serif text-2xl font-semibold">
          {initials(user)}
        </span>
        <div className="min-w-0">
          <p className="text-ink truncate font-serif text-lg font-semibold">
            {user.name || user.username || 'Your account'}
          </p>
          <p className="text-ink-faint truncate text-[13px]">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
        <Field label="Name" error={errors.name?.message}>
          {({ id }) => <Input id={id} autoComplete="name" {...register('name')} />}
        </Field>

        <Field label="Username" error={errors.username?.message} status={usernameStatus}>
          {({ id }) => (
            <Input
              id={id}
              autoComplete="username"
              spellCheck={false}
              {...register('username', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.toLowerCase();
                },
              })}
            />
          )}
        </Field>

        <Field label="Email" hint="Contact support to change your email">
          {({ id }) => (
            <Input id={id} value={user.email} readOnly disabled className="opacity-70" />
          )}
        </Field>

        <div>
          <Button
            size="sm"
            type="submit"
            loading={isLoading}
            disabled={!isDirty || taken || (changed && !formatOk)}
          >
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
