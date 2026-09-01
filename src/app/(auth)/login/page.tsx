'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useLoginMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { tokenStore } from '@/lib/auth/tokenStore';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      const res = await login(values).unwrap();
      tokenStore.set(res.accessToken, res.refreshToken);
      router.replace('/thoughts');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not sign in'));
    }
  };

  return (
    <div className="border-hairline bg-surface rounded-2xl border p-6">
      <h2 className="text-ink mb-5 text-[15px] font-semibold">Sign in</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
            />
          )}
        </Field>
        <Button type="submit" loading={isLoading} className="mt-1 w-full">
          Sign in
        </Button>
      </form>
      <p className="text-ink-muted mt-4 text-center text-sm">
        New here?{' '}
        <Link href="/register" className="text-accent font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
