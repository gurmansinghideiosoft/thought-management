'use client';

import { forwardRef, useId } from 'react';

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
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
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
      ) : hint ? (
        <p className="text-ink-faint text-[13px]">{hint}</p>
      ) : null}
    </div>
  );
}
