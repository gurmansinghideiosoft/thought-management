'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ExportCard } from '@/components/settings/export-card';
import { PasswordCard } from '@/components/settings/password-card';
import { ProfileCard } from '@/components/settings/profile-card';
import { CenteredSpinner } from '@/components/ui/misc';
import { useMeQuery } from '@/lib/api/api';

export default function SettingsPage() {
  const { data } = useMeQuery();
  const user = data?.user;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader title="Settings" />

      <div className="content-column flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
        {user ? (
          <>
            <ProfileCard user={user} />
            <PasswordCard />
            <ExportCard />
          </>
        ) : (
          <CenteredSpinner />
        )}
      </div>
    </div>
  );
}
