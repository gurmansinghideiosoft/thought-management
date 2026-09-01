import { cn } from '@/lib/cn';

/**
 * The Margin mark — a page's margin rule, tacked at the top, with a few lines
 * of writing set back from it. Strokes use `currentColor` so the mark takes
 * the surrounding text colour; the tack is always the brand accent.
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* the margin rule */}
      <path d="M11 6V27" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* lines of writing, set back from the rule */}
      <path
        d="M16.5 11H27M16.5 16.5H27M16.5 22H23"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* the tack — what matters, marked in the margin */}
      <circle cx="11" cy="6" r="3" className="fill-accent" />
    </svg>
  );
}

/** Mark + "Margin" wordmark. Inherits `text-*` from the caller. */
export function Logo({
  className,
  markSize = 26,
  textClassName,
}: {
  className?: string;
  markSize?: number;
  textClassName?: string;
}) {
  return (
    <span className={cn('text-ink inline-flex items-center gap-2', className)}>
      <LogoMark size={markSize} />
      <span
        className={cn('font-serif text-lg font-semibold tracking-tight', textClassName)}
      >
        Margin
      </span>
    </span>
  );
}
