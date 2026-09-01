'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { CenteredSpinner } from '@/components/ui/misc';
import { tokenStore } from '@/lib/auth/tokenStore';
import { useSession } from '@/lib/auth/useSession';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  const { status, user, signOut } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!tokenStore.hasSession() || status === 'anonymous') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status !== 'authenticated' || !user) {
    return <CenteredSpinner label="Loading your workspace…" />;
  }

  return (
    <AppShell user={user} onSignOut={signOut}>
      {children}
    </AppShell>
  );
}
