'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-[0_1px_2px_rgba(26,23,18,0.12)] hover:brightness-[0.94] active:brightness-90',
  secondary:
    'bg-surface text-ink border border-hairline hover:bg-surface-2 active:bg-surface-3',
  ghost: 'text-ink-muted hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger/10 text-danger hover:bg-danger hover:text-white',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        'focus-ring inline-flex items-center justify-center font-medium transition-[background-color,filter,color,transform,box-shadow] duration-150 select-none',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'text-ink-faint focus-ring inline-flex size-8 items-center justify-center rounded-lg transition-[background-color,color,transform]',
        'hover:bg-surface-2 hover:text-ink active:scale-95',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
