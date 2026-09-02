'use client';

import { use, useMemo, useState } from 'react';

import { EntryComposer } from '@/components/entries/entry-composer';
import { Timeline } from '@/components/entries/timeline';
import {
  type TimelineFilterState,
  TimelineFilters,
} from '@/components/entries/timeline-filters';
import { ThoughtDiscussion } from '@/components/thoughts/thought-discussion';
import { ThoughtHeader } from '@/components/thoughts/thought-header';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { useGetThoughtQuery, useListTagsQuery } from '@/lib/api/api';
import { useDebounced } from '@/lib/use-debounced';

export default function ThoughtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: thought, isLoading, isError } = useGetThoughtQuery(id);
  const isCollaborator = thought?.role === 'collaborator';
  // Tag CRUD is owner-only on the API; collaborators just read the thought's tags.
  const { data: tags } = useListTagsQuery(id, { skip: isCollaborator });
  const [filters, setFilters] = useState<TimelineFilterState>({});
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebounced(rawQuery.trim(), 300);

  const timelineArgs = useMemo(
    () => ({
      thoughtId: id,
      tagId: filters.tagId,
      starred: filters.starred,
      kind: filters.kind,
      q: query || undefined,
    }),
    [id, filters, query],
  );

  if (isLoading) return <CenteredSpinner />;
  if (isError || !thought) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          title="Thought not found"
          description="It may have been deleted, or it isn’t yours."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ThoughtHeader thought={thought} />
      <TimelineFilters
        tags={tags ?? []}
        value={filters}
        onChange={setFilters}
        query={rawQuery}
        onQueryChange={setRawQuery}
      />
      <Timeline args={timelineArgs} tags={thought.tags} readOnly={isCollaborator} />
      {isCollaborator ? null : <EntryComposer thoughtId={id} />}
      <ThoughtDiscussion thoughtId={id} />
    </div>
  );
}
