'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { CenteredSpinner } from '@/components/ui/misc';
import { tokenStore } from '@/lib/auth/tokenStore';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(tokenStore.hasSession() ? '/thoughts' : '/login');
  }, [router]);

  return <CenteredSpinner />;
}
