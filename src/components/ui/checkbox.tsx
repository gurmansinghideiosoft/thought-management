'use client';

import { Check } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** A small checkbox matched to the task toggle: 16px, rounded, accent fill. */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, disabled, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'focus-halo inline-flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        checked
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-hairline hover:border-accent',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {checked ? <Check size={11} strokeWidth={3} /> : null}
    </button>
  ),
);
Checkbox.displayName = 'Checkbox';
