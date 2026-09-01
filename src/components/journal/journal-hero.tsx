'use client';

import { Flame, PenLine } from 'lucide-react';

import { BannerBar } from '@/components/banners/banner-bar';
import { Button } from '@/components/ui/button';
import { greeting, journalNudge } from '@/lib/journal/prompt';
import type { JournalStreak } from '@/lib/types';

export function JournalHero({
  name,
  bannerId,
  onChangeBanner,
  streak,
  onWrite,
  writing,
}: {
  name: string;
  bannerId: string | null;
  onChangeBanner: (id: string | null) => void;
  streak?: JournalStreak;
  onWrite: () => void;
  writing: boolean;
}) {
  const hour = new Date().getHours();
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const nudge = journalNudge({
    hour,
    name: firstName,
    currentStreak: streak?.current ?? 0,
    writtenToday: streak?.writtenToday ?? false,
  });

  return (
    <BannerBar
      value={bannerId}
      onChange={onChangeBanner}
      className="h-[38vh] max-h-[440px] min-h-[240px]"
    >
      <p className="text-[13px] font-medium tracking-wide text-white/75">
        {greeting(hour, firstName)}
      </p>
      <p className="mt-1 max-w-xl font-serif text-xl leading-snug font-semibold text-white drop-shadow sm:text-[26px]">
        {nudge}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          size="md"
          onClick={onWrite}
          loading={writing}
          className="shadow-lg shadow-black/25"
        >
          <PenLine size={16} />
          {streak?.writtenToday ? 'Open today’s page' : 'Write today'}
        </Button>

        {streak && (streak.current > 0 || streak.longest > 0) ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <Flame size={14} style={{ color: '#f0a04b' }} />
            {streak.current > 0
              ? `${streak.current}-day streak`
              : `Best: ${streak.longest} days`}
            {streak.current > 0 && streak.longest > streak.current ? (
              <span className="text-white/60">· best {streak.longest}</span>
            ) : null}
          </span>
        ) : null}
      </div>
    </BannerBar>
  );
}
