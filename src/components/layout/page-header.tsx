'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-hairline bg-paper/80 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        {backHref ? (
          <Link
            href={backHref}
            className="text-ink-faint hover:bg-surface-2 hover:text-ink -ml-1 shrink-0 rounded-lg p-1.5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-ink truncate font-serif text-xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-ink-muted truncate text-[13px]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
