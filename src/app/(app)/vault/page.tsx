'use client';

import { VaultDashboard } from '@/components/vault/vault-dashboard';
import { VaultSetup } from '@/components/vault/vault-setup';
import { VaultUnlock } from '@/components/vault/vault-unlock';
import { CenteredSpinner } from '@/components/ui/misc';
import { useVault } from '@/lib/vault/vault-context';

export default function VaultPage() {
  const { status } = useVault();

  if (status === 'loading') return <CenteredSpinner label="Opening the vault…" />;
  if (status === 'no-vault') return <VaultSetup />;
  if (status === 'locked') return <VaultUnlock />;
  return <VaultDashboard />;
}
