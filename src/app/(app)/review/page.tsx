'use client';

import {
  addDays,
  addMonths,
  endOfWeek,
  isSameMonth,
  isSameWeek,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { useMemo, useRef, useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { CarryForwardCard } from '@/components/review/carry-forward-card';
import { PastReviews } from '@/components/review/past-reviews';
import { PeriodSwitcher } from '@/components/review/period-switcher';
import { ReviewHero } from '@/components/review/review-hero';
import {
  FinishedMetric,
  HabitsMetric,
  JournalMetric,
  SpendingMetric,
  ThoughtsMetric,
} from '@/components/review/review-metrics';
import {
  ReflectionForm,
  type ReflectionFormHandle,
} from '@/components/review/reflection-form';
import { SkeletonCards } from '@/components/ui/skeleton';
import { useMeQuery, useReviewSummaryQuery } from '@/lib/api/api';
import {
  fromDateKey,
  fromMonthKey,
  prettyMonth,
  prettyRange,
  toDateKey,
  toMonthKey,
} from '@/lib/date';
import type { ReviewPeriod } from '@/lib/types';

function periodMeta(
  period: ReviewPeriod,
  anchor: string,
  today: string,
): { label: string; isCurrent: boolean } {
  const a = fromDateKey(anchor);
  const t = fromDateKey(today);
  if (period === 'week') {
    const isCurrent = isSameWeek(a, t, { weekStartsOn: 1 });
    return {
      isCurrent,
      label: isCurrent
        ? 'This week'
        : prettyRange(
            toDateKey(startOfWeek(a, { weekStartsOn: 1 })),
            toDateKey(endOfWeek(a, { weekStartsOn: 1 })),
          ),
    };
  }
  const isCurrent = isSameMonth(a, t);
  return { isCurrent, label: isCurrent ? 'This month' : prettyMonth(toMonthKey(a)) };
}

const anchorFromKey = (period: ReviewPeriod, key: string): string =>
  period === 'month' ? toDateKey(fromMonthKey(key)) : toDateKey(parseISO(key));

export default function ReviewPage() {
  const today = useMemo(() => toDateKey(new Date()), []);
  const [period, setPeriod] = useState<ReviewPeriod>('week');
  const [anchor, setAnchor] = useState(today);
  const formRef = useRef<ReflectionFormHandle>(null);

  const { data: me } = useMeQuery();
  const currency = me?.user.currency ?? 'USD';

  const { data: summary, isLoading } = useReviewSummaryQuery({ period, anchor, today });

  const meta = periodMeta(period, anchor, today);

  const step = (dir: -1 | 1) => {
    const a = fromDateKey(anchor);
    setAnchor(toDateKey(period === 'week' ? addDays(a, dir * 7) : addMonths(a, dir)));
  };

  const switchPeriod = (next: ReviewPeriod) => {
    setPeriod(next);
    setAnchor(today);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Review"
        actions={
          <PeriodSwitcher
            period={period}
            onPeriodChange={switchPeriod}
            onStep={step}
            label={meta.label}
            isCurrent={meta.isCurrent}
            onReset={() => setAnchor(today)}
          />
        }
      />

      <div className="content-column flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
        {isLoading || !summary ? (
          <SkeletonCards count={4} />
        ) : (
          <>
            <ReviewHero summary={summary} />

            {summary.prevReview ? (
              <CarryForwardCard
                prev={summary.prevReview}
                periodNoun={period}
                onRespond={() => formRef.current?.focusReflection()}
              />
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <FinishedMetric tasks={summary.tasks} />
              <JournalMetric journal={summary.journal} />
              <SpendingMetric finance={summary.finance} currency={currency} />
              <ThoughtsMetric thoughts={summary.thoughts} />
              <HabitsMetric habits={summary.habits} />
            </div>

            <ReflectionForm
              key={`${period}:${summary.periodKey}`}
              ref={formRef}
              period={period}
              periodKey={summary.periodKey}
              rangeTo={summary.range.to}
              saved={summary.saved}
            />

            <PastReviews
              period={period}
              onOpen={(key) => setAnchor(anchorFromKey(period, key))}
            />
          </>
        )}
      </div>
    </div>
  );
}
