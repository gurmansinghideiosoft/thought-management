'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

import { cn } from '@/lib/cn';

const base =
  'w-full rounded-lg border border-hairline bg-field px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, 'h-10', className)} {...props} />
));
Input.displayName = 'Input';

/** A text input with a show/hide toggle. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>
>(({ className, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        className={cn(base, 'h-10 pr-10', className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="text-ink-faint hover:text-ink absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, 'min-h-[80px] resize-y leading-relaxed', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export function Field({
  label,
  error,
  hint,
  status,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  /** A caller-styled line (e.g. live validation), shown when there's no error. */
  status?: React.ReactNode;
  children: (props: { id: string }) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink-muted text-[13px] font-medium">
        {label}
      </label>
      {children({ id })}
      {error ? (
        <p className="text-danger text-[13px]">{error}</p>
      ) : status ? (
        <div className="text-[13px]">{status}</div>
      ) : hint ? (
        <p className="text-ink-faint text-[13px]">{hint}</p>
      ) : null}
    </div>
  );
}
