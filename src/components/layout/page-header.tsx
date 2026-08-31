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
    <header className="border-border bg-canvas/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="reading-column flex items-center gap-3 px-4 py-3.5">
        {backHref ? (
          <Link
            href={backHref}
            className="text-ink-faint hover:bg-surface-2 hover:text-ink -ml-1 shrink-0 rounded-lg p-1 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-ink truncate text-[15px] font-semibold">{title}</h1>
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
