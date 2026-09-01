'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { UsernameSetup } from '@/components/onboarding/username-setup';
import { CenteredSpinner } from '@/components/ui/misc';
import { tokenStore } from '@/lib/auth/tokenStore';
import { useSession } from '@/lib/auth/useSession';
import { RealtimeProvider } from '@/lib/realtime/realtime-provider';
import { VaultProvider } from '@/lib/vault/vault-context';

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

  // Accounts from before usernames existed must pick one before continuing.
  if (!user.username) {
    return (
      <UsernameSetup suggestion={user.name.toLowerCase().replace(/[^a-z0-9_]/g, '')} />
    );
  }

  return (
    <RealtimeProvider>
      <VaultProvider>
        <AppShell user={user} onSignOut={signOut}>
          {children}
        </AppShell>
      </VaultProvider>
    </RealtimeProvider>
  );
}
