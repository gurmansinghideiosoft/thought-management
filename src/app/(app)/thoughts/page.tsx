'use client';

import { Lightbulb, Search } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { CreateThoughtDialog } from '@/components/thoughts/create-thought-dialog';
import { ThoughtCard } from '@/components/thoughts/thought-card';
import { Input } from '@/components/ui/input';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { Select } from '@/components/ui/select';
import { type ListThoughtsArgs, useListThoughtsQuery } from '@/lib/api/api';
import { useDebounced } from '@/lib/use-debounced';

type Sort = NonNullable<ListThoughtsArgs['sort']>;

const SORTS: readonly { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Recent activity' },
  { value: 'created', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
];

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const;

export default function ThoughtsPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
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

      <div className="content-column flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
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
          <Select ariaLabel="Sort" value={sort} onValueChange={setSort} options={SORTS} />
          <Select
            ariaLabel="Status"
            value={status}
            onValueChange={setStatus}
            options={STATUSES}
          />
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
            className="grid gap-3 transition-opacity sm:grid-cols-2 xl:grid-cols-3"
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
