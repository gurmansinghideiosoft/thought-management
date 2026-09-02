'use client';

import { DailyQuote } from '@/components/home/daily-quote';
import { HabitsToday } from '@/components/home/habits-today';
import { HeroBanner } from '@/components/home/hero-banner';
import { RecentThoughts } from '@/components/home/recent-thoughts';
import { TodayTasks } from '@/components/home/today-tasks';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useMeQuery, useUpdateMeMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

export default function HomePage() {
  const { data } = useMeQuery();
  const user = data?.user;
  const [updateMe] = useUpdateMeMutation();
  const toast = useToast();

  if (!user) return <CenteredSpinner />;

  const setBanner = async (homeBanner: string | null) => {
    try {
      await updateMe({ homeBanner }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change the background'));
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <HeroBanner
        name={user.name || user.username || ''}
        bannerId={user.homeBanner}
        onChangeBanner={setBanner}
      />

      <div className="content-column flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
        <DailyQuote />
        <div className="grid gap-4 lg:grid-cols-2">
          <TodayTasks />
          <HabitsToday />
          <RecentThoughts />
        </div>
      </div>
    </div>
  );
}
