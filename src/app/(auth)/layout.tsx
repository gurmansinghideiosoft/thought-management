'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { CenteredSpinner } from '@/components/ui/misc';
import { useSession } from '@/lib/auth/useSession';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/home');
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <CenteredSpinner />;
  }

  return (
    <main className="flex min-h-full flex-1 flex-col md:flex-row">
      {/* Brand panel — the sign-in screen laid out against a margin. */}
      <aside className="border-hairline bg-surface/70 relative flex shrink-0 flex-col justify-center border-b px-6 py-12 backdrop-blur-sm md:w-[44%] md:max-w-xl md:border-r md:border-b-0 md:px-16 md:py-16 lg:px-24">
        <span
          aria-hidden
          className="bg-hairline absolute top-16 bottom-16 left-16 hidden w-px md:block lg:left-24"
        />
        <span
          aria-hidden
          className="bg-accent absolute top-16 left-16 hidden size-2 -translate-x-1/2 rounded-full md:block lg:left-24"
        />

        <div className="flex flex-col items-start gap-5 md:pl-10">
          <Link
            href="/"
            aria-label="Back to the Margin home page"
            className="focus-halo flex flex-col items-start gap-5 rounded-lg transition-opacity hover:opacity-80"
          >
            <LogoMark size={80} className="text-ink hidden md:block" />
            <LogoMark size={52} className="text-ink md:hidden" />
            <div>
              <h1 className="text-ink font-serif text-3xl font-semibold tracking-tight md:text-5xl">
                Margin
              </h1>
              <p className="text-ink-muted mt-2 text-[15px] md:text-base">
                Room to think.
              </p>
            </div>
          </Link>
          <p className="text-ink-faint hidden max-w-xs text-sm leading-relaxed md:block">
            Set the day down — tasks, notes, the journal — so your head keeps its open
            room for the work that needs it.
          </p>
        </div>
      </aside>

      {/* Form */}
      <div className="flex flex-1 flex-col px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="text-ink-faint hover:text-ink focus-halo inline-flex items-center gap-1.5 self-start rounded-lg px-1 py-1 text-[13px] font-medium transition-colors"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </main>
  );
}
