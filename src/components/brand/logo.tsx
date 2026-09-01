import { cn } from '@/lib/cn';

/**
 * The Thoughts mark — a rounded note/bubble with two lines of writing and a
 * small accent spark. Strokes use `currentColor` so it takes the surrounding
 * text colour; the spark is always the brand accent.
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
      <path
        d="M7 5h13a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-7.5L6 28v-6a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M7 5h13a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-7.5L6 28v-6a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 11.5h11M8.5 15.5h6.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="25.5" cy="6.5" r="3.5" className="fill-accent" />
    </svg>
  );
}

/** Mark + "Thoughts" wordmark. Inherits `text-*` from the caller. */
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
        Thoughts
      </span>
    </span>
  );
}
