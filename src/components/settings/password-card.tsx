'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, PasswordInput } from '@/components/ui/input';
import { Card } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useChangePasswordMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { tokenStore } from '@/lib/auth/tokenStore';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });
type Values = z.infer<typeof schema>;

export function PasswordCard() {
  const toast = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      tokenStore.set(res.accessToken, res.refreshToken);
      reset();
      toast.success('Password changed — other devices have been signed out');
    } catch (err) {
      const msg = errorMessage(err, 'Could not change your password');
      if (/current password/i.test(msg)) {
        setError('currentPassword', { message: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-ink font-serif text-lg font-semibold">Change password</h2>
      <p className="text-ink-muted mt-1 text-sm">
        Changing your password signs you out on every other device.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex max-w-sm flex-col gap-4"
      >
        <Field label="Current password" error={errors.currentPassword?.message}>
          {({ id }) => (
            <PasswordInput
              id={id}
              autoComplete="current-password"
              {...register('currentPassword')}
            />
          )}
        </Field>
        <Field label="New password" error={errors.newPassword?.message}>
          {({ id }) => (
            <PasswordInput
              id={id}
              autoComplete="new-password"
              {...register('newPassword')}
            />
          )}
        </Field>
        <Field label="Confirm new password" error={errors.confirm?.message}>
          {({ id }) => (
            <PasswordInput id={id} autoComplete="new-password" {...register('confirm')} />
          )}
        </Field>
        <div>
          <Button size="sm" type="submit" loading={isLoading}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}
