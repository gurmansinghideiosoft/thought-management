import { cn } from '@/lib/cn';

/** A single shimmer block. Compose these for bespoke skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-surface-2 animate-pulse rounded-md motion-reduce:animate-none',
        className,
      )}
    />
  );
}

/** Placeholder for a vertical list of row cards. `bare` drops the card chrome. */
export function SkeletonRows({
  rows = 6,
  bare = false,
}: {
  rows?: number;
  bare?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3',
            bare ? 'py-1.5' : 'border-hairline bg-surface rounded-xl border p-4',
          )}
        >
          {bare ? null : <Skeleton className="size-9 shrink-0 rounded-lg" />}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder for a responsive card grid (e.g. the Thoughts list). */
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-hairline bg-surface flex h-40 flex-col gap-3 rounded-xl border p-4"
        >
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="mt-auto h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
