'use client';

import { format } from 'date-fns';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';

import { HabitManager } from '@/components/habits/habit-manager';
import { HabitRow } from '@/components/habits/habit-row';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useListHabitsQuery } from '@/lib/api/api';
import { toDateKey } from '@/lib/date';

export default function HabitsPage() {
  const [manageOpen, setManageOpen] = useState(false);
  const today = toDateKey(new Date());
  const { data: habits, isLoading } = useListHabitsQuery({ date: today });

  const done = habits?.filter((h) => h.doneToday).length ?? 0;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Habits"
        subtitle={
          habits && habits.length > 0
            ? `${done} of ${habits.length} done today`
            : undefined
        }
        actions={
          <Button size="sm" variant="secondary" onClick={() => setManageOpen(true)}>
            <Settings2 size={14} />
            Manage
          </Button>
        }
      />
      <HabitManager open={manageOpen} onOpenChange={setManageOpen} />

      <div className="reading-column flex-1 px-4 py-6 sm:px-6">
        <p className="text-ink-faint mb-4 text-[13px]">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>

        {isLoading ? (
          <SkeletonRows rows={4} />
        ) : !habits || habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            description="Add a few you want to keep up daily — meditate, read, a glass of water. Then tick them off as part of your end-of-day pass."
            action={
              <Button size="sm" onClick={() => setManageOpen(true)}>
                Add a habit
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {habits.map((h) => (
              <HabitRow key={h.id} habit={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
