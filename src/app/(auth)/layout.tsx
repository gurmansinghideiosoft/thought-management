'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { CenteredSpinner } from '@/components/ui/misc';
import { useSession } from '@/lib/auth/useSession';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/thoughts');
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <CenteredSpinner />;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-ink text-lg font-semibold tracking-tight">Thoughts</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Capture an idea, then grow it over time.
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
