'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, Input, PasswordInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCheckUsernameQuery, useRegisterMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { tokenStore } from '@/lib/auth/tokenStore';
import { useDebounced } from '@/lib/use-debounced';

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, '3–30 letters, digits or underscores'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [signup, { isLoading }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const rawUsername = useWatch({ control, name: 'username' }) ?? '';
  const wanted = useDebounced(rawUsername.trim().toLowerCase(), 400);
  const formatOk = USERNAME_RE.test(wanted);

  const { data: check, isFetching: checking } = useCheckUsernameQuery(wanted, {
    skip: !formatOk,
  });
  const resolved = !checking && check?.username === wanted ? check : undefined;
  const taken = resolved?.available === false;

  const usernameStatus =
    !rawUsername || errors.username ? undefined : formatOk ? (
      checking || !resolved ? (
        <span className="text-ink-faint inline-flex items-center gap-1.5">
          <Loader2 size={13} className="animate-spin" /> Checking availability…
        </span>
      ) : resolved.available ? (
        <span className="text-success inline-flex items-center gap-1.5">
          <Check size={13} /> @{wanted} is available
        </span>
      ) : (
        <span className="text-danger inline-flex items-center gap-1.5">
          <X size={13} /> @{wanted} is already taken
        </span>
      )
    ) : undefined;

  const onSubmit = async (values: Values) => {
    if (taken) {
      toast.error('That username is taken — try another.');
      return;
    }
    try {
      const res = await signup({
        email: values.email,
        password: values.password,
        username: values.username,
        name: values.name || undefined,
      }).unwrap();
      tokenStore.set(res.accessToken, res.refreshToken);
      router.replace('/home');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your account'));
    }
  };

  return (
    <div className="border-hairline bg-surface shadow-popover rounded-2xl border p-6">
      <h2 className="text-ink mb-5 font-serif text-lg font-semibold">
        Create your account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Name" hint="Optional" error={errors.name?.message}>
          {({ id }) => (
            <Input id={id} autoComplete="name" placeholder="Jane" {...register('name')} />
          )}
        </Field>
        <Field
          label="Username"
          hint="How others find you in chat and sharing"
          error={errors.username?.message}
          status={usernameStatus}
        >
          {({ id }) => (
            <Input
              id={id}
              autoComplete="username"
              placeholder="jane_doe"
              spellCheck={false}
              {...register('username', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.toLowerCase();
                },
              })}
            />
          )}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {({ id }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
          )}
        </Field>
        <Field label="Password" error={errors.password?.message}>
          {({ id }) => (
            <PasswordInput
              id={id}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register('password')}
            />
          )}
        </Field>
        <Button
          type="submit"
          loading={isLoading}
          disabled={taken}
          className="mt-1 w-full"
        >
          Create account
        </Button>
      </form>
      <p className="text-ink-muted mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
