'use client';

import { Lightbulb, Search } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { CreateThoughtDialog } from '@/components/thoughts/create-thought-dialog';
import { ThoughtCard } from '@/components/thoughts/thought-card';
import { Input } from '@/components/ui/input';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { type ListThoughtsArgs, useListThoughtsQuery } from '@/lib/api/api';
import { useDebounced } from '@/lib/use-debounced';

const SORTS: { value: NonNullable<ListThoughtsArgs['sort']>; label: string }[] = [
  { value: 'recent', label: 'Recent activity' },
  { value: 'created', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title' },
];

export default function ThoughtsPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<NonNullable<ListThoughtsArgs['sort']>>('recent');
  const [status, setStatus] = useState<'active' | 'archived' | ''>('');
  const debouncedQ = useDebounced(q, 300);

  const { data, isLoading, isFetching } = useListThoughtsQuery({
    q: debouncedQ || undefined,
    sort,
    status: status || undefined,
    limit: 50,
  });

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Thoughts"
        subtitle={data ? `${data.pagination.total} in total` : undefined}
        actions={<CreateThoughtDialog />}
      />

      <div className="reading-column w-full flex-1 px-4 py-5">
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
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border-border-strong bg-surface text-ink-muted h-10 rounded-lg border px-2.5 text-sm focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="border-border-strong bg-surface text-ink-muted h-10 rounded-lg border px-2.5 text-sm focus:outline-none"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {isLoading ? (
          <CenteredSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Lightbulb size={22} />}
            title={debouncedQ ? 'No matches' : 'No thoughts yet'}
            description={
              debouncedQ
                ? 'Try a different search.'
                : 'Start one — a title and the rough idea is enough.'
            }
            action={debouncedQ ? undefined : <CreateThoughtDialog />}
          />
        ) : (
          <div
            className="flex flex-col gap-2.5 transition-opacity"
            style={{ opacity: isFetching ? 0.6 : 1 }}
          >
            {items.map((t) => (
              <ThoughtCard key={t.id} thought={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
