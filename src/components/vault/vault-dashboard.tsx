'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Globe,
  KeyRound,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  StickyNote,
} from 'lucide-react';
import { forwardRef, useMemo, useState } from 'react';

import { CredentialDetail } from '@/components/vault/credential-detail';
import { CredentialDialog } from '@/components/vault/credential-dialog';
import { RekeyDialog } from '@/components/vault/rekey-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { Button, IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/misc';
import { Input } from '@/components/ui/input';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useListCredentialsQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import type { CredentialCategory, CredentialMeta } from '@/lib/types';
import { useVault } from '@/lib/vault/vault-context';

const CATEGORY_ICON: Record<CredentialCategory, typeof KeyRound> = {
  login: Globe,
  api: KeyRound,
  note: StickyNote,
  other: KeyRound,
};

const CATEGORY_TABS: { value: CredentialCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'login', label: 'Logins' },
  { value: 'api', label: 'API / keys' },
  { value: 'note', label: 'Notes' },
  { value: 'other', label: 'Other' },
];

export function VaultDashboard() {
  const { lock } = useVault();
  const { data, isLoading } = useListCredentialsQuery();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CredentialCategory | 'all'>('all');
  const [tag, setTag] = useState<string | null>(null);
  const [rekeyOpen, setRekeyOpen] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);
  const allTags = useMemo(
    () => [...new Set(items.flatMap((c) => c.tags))].sort(),
    [items],
  );

  const filtered = items.filter((c) => {
    if (cat !== 'all' && c.category !== cat) return false;
    if (tag && !c.tags.includes(tag)) return false;
    if (q.trim() && !c.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Vault"
        subtitle={`${items.length} ${items.length === 1 ? 'credential' : 'credentials'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={lock}>
              <Lock size={14} />
              Lock
            </Button>
            <CredentialDialog
              mode="create"
              trigger={
                <Button size="sm">
                  <Plus size={14} />
                  New
                </Button>
              }
            />
            <Dropdown>
              <DropdownTrigger asChild>
                <IconButton label="Vault settings">
                  <MoreHorizontal size={18} />
                </IconButton>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem onSelect={() => setRekeyOpen(true)}>
                  Change master password
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
            <RekeyDialog open={rekeyOpen} onOpenChange={setRekeyOpen} />
          </div>
        }
      />

      <div className="content-column flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={15}
              className="text-ink-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name"
              className="pl-9"
            />
          </div>
          <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
            {CATEGORY_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setCat(t.value)}
                className={cn(
                  'h-7 rounded-md px-2 text-[12px] transition-colors',
                  cat === t.value
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {allTags.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] transition-colors',
                  tag === t
                    ? 'border-accent/40 bg-accent/12 text-accent'
                    : 'border-hairline text-ink-muted hover:text-ink',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={22} />}
            title={items.length === 0 ? 'Your vault is empty' : 'No matches'}
            description={
              items.length === 0
                ? 'Add a login, an API key, or a secure note — all encrypted in your browser.'
                : 'Try a different search or filter.'
            }
            action={
              items.length === 0 ? (
                <CredentialDialog
                  mode="create"
                  trigger={
                    <Button size="sm">
                      <Plus size={14} />
                      New credential
                    </Button>
                  }
                />
              ) : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <CredentialDetail
                  credential={c}
                  trigger={<CredentialRow credential={c} />}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const CredentialRow = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & { credential: CredentialMeta }
>(function CredentialRow({ credential, className, ...rest }, ref) {
  const Icon = CATEGORY_ICON[credential.category];
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group border-hairline bg-surface hover:border-ink-faint/40 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
        className,
      )}
      {...rest}
    >
      <span className="bg-surface-2 text-ink-faint grid size-9 shrink-0 place-items-center rounded-lg">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-medium">{credential.name}</p>
        <p className="text-ink-faint flex items-center gap-1.5 text-[12px]">
          {credential.tags.slice(0, 3).map((t) => (
            <span key={t} className="border-hairline rounded-full border px-1.5">
              {t}
            </span>
          ))}
          <span>
            updated{' '}
            {formatDistanceToNow(new Date(credential.updatedAt), { addSuffix: true })}
          </span>
        </p>
      </div>
    </button>
  );
});
CredentialRow.displayName = 'CredentialRow';
