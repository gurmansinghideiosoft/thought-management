'use client';

import { DailyQuote } from '@/components/home/daily-quote';
import { HeroBanner } from '@/components/home/hero-banner';
import { RecentThoughts } from '@/components/home/recent-thoughts';
import { TodayTasks } from '@/components/home/today-tasks';
import { CenteredSpinner } from '@/components/ui/misc';
import { useMeQuery } from '@/lib/api/api';

export default function HomePage() {
  const { data } = useMeQuery();
  const user = data?.user;

  if (!user) return <CenteredSpinner />;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <HeroBanner name={user.name || user.username || ''} />

      <div className="content-column flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
        <DailyQuote />
        <div className="grid gap-4 lg:grid-cols-2">
          <TodayTasks />
          <RecentThoughts />
        </div>
      </div>
    </div>
  );
}
