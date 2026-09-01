'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Logo } from '@/components/brand/logo';
import { CenteredSpinner } from '@/components/ui/misc';
import { useSession } from '@/lib/auth/useSession';
import { bannerFor } from '@/lib/banners';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/home');
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <CenteredSpinner />;
  }

  const bg = bannerFor('mountain-dawn');

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <Image src={bg.src} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <Logo markSize={32} textClassName="text-2xl" />
          <p className="mt-2 text-sm text-white/80">
            A quiet place for ideas, tasks, and the day just gone.
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
