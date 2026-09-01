'use client';

import { Spinner as HeroSpinner } from '@heroui/react';

import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <HeroSpinner className={cn('text-ink-faint', className)} size="sm" />;
}

export function CenteredSpinner({ label }: { label?: string }) {
  return (
    <div className="text-ink-faint flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <HeroSpinner size="lg" className="text-accent" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-hairline bg-surface rounded-xl border shadow-[0_1px_2px_rgba(26,23,18,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon ? (
        <div className="bg-surface-2/60 text-ink-faint/80 mb-2 grid size-14 place-items-center rounded-2xl">
          {icon}
        </div>
      ) : null}
      <p className="text-ink font-serif text-lg font-semibold">{title}</p>
      {description ? (
        <p className="text-ink-muted max-w-xs text-sm leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
