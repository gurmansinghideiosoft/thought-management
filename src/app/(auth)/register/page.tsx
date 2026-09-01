'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useRegisterMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { tokenStore } from '@/lib/auth/tokenStore';

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, '3–30 letters, digits or underscores'),
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
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      const res = await signup({
        email: values.email,
        password: values.password,
        username: values.username,
        name: values.name || undefined,
      }).unwrap();
      tokenStore.set(res.accessToken, res.refreshToken);
      router.replace('/thoughts');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your account'));
    }
  };

  return (
    <div className="border-hairline bg-surface rounded-2xl border p-6">
      <h2 className="text-ink mb-5 text-[15px] font-semibold">Create your account</h2>
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
        >
          {({ id }) => (
            <Input
              id={id}
              autoComplete="username"
              placeholder="jane_doe"
              {...register('username')}
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
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register('password')}
            />
          )}
        </Field>
        <Button type="submit" loading={isLoading} className="mt-1 w-full">
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
