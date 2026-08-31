'use client';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('text-ink-faint animate-spin', className)} size={18} />;
}

export function CenteredSpinner({ label }: { label?: string }) {
  return (
    <div className="text-ink-faint flex flex-1 flex-col items-center justify-center gap-3 py-20">
      <Spinner className="size-6" />
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
      className={cn('border-border bg-surface rounded-xl border', className)}
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
    <div className="border-border-strong flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
      {icon ? <div className="text-ink-faint mb-1">{icon}</div> : null}
      <p className="text-ink font-medium">{title}</p>
      {description ? (
        <p className="text-ink-muted max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
