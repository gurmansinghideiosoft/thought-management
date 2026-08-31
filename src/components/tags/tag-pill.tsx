'use client';

import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

export function TagPill({
  name,
  color,
  count,
  active,
  onClick,
  onRemove,
  className,
}: {
  name: string;
  color?: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}) {
  const dot = color ?? 'var(--color-ink-faint)';
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      style={
        active && color
          ? {
              color,
              borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors',
        active
          ? 'border-accent/40 bg-accent/12 text-accent'
          : 'border-hairline bg-surface text-ink-muted',
        onClick && !active && 'hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      {name}
      {typeof count === 'number' ? <span className="text-ink-faint">{count}</span> : null}
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-ink-faint hover:text-ink -mr-1 rounded-full p-0.5"
          aria-label={`Remove ${name}`}
        >
          <X size={11} />
        </button>
      ) : null}
    </Comp>
  );
}
