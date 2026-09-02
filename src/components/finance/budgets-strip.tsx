'use client';

import { useMemo } from 'react';

import { useFinanceSummaryQuery, useListFinanceTagsQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';
import { monthRange, toMonthKey } from '@/lib/date';
import { formatMoney } from '@/lib/finance/money';
import type { FinanceTag } from '@/lib/types';

type BudgetedTag = FinanceTag & { monthlyBudget: number };

export function BudgetsStrip({ currency }: { currency: string }) {
  // Budgets are always about the current calendar month, whatever the page range.
  const month = useMemo(() => monthRange(toMonthKey(new Date())), []);
  const { data: summary } = useFinanceSummaryQuery(month);
  const { data: tags } = useListFinanceTagsQuery();

  const budgeted = (tags ?? []).filter((t): t is BudgetedTag => t.monthlyBudget != null);
  if (budgeted.length === 0) return null;

  const spentByTag = new Map((summary?.byTag ?? []).map((b) => [b.tagId, b.total]));

  const rows = budgeted
    .map((t) => {
      const spent = spentByTag.get(t.id) ?? 0;
      return { t, spent, pct: t.monthlyBudget > 0 ? spent / t.monthlyBudget : 0 };
    })
    .sort((a, b) => b.pct - a.pct);

  return (
    <section className="mt-8">
      <h2 className="text-ink font-serif text-lg font-semibold">Budgets</h2>
      <p className="text-ink-faint mb-3 text-[12px]">This month</p>
      <div className="flex flex-col gap-3.5">
        {rows.map(({ t, spent, pct }) => {
          const over = pct > 1;
          const bar = over ? 'var(--danger)' : pct >= 0.8 ? 'var(--warning)' : t.color;
          return (
            <div key={t.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="truncate">{t.name}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className={cn('font-medium', over ? 'text-danger' : 'text-ink')}>
                    {formatMoney(spent, currency)}
                  </span>
                  <span className="text-ink-faint">
                    {' '}
                    / {formatMoney(t.monthlyBudget, currency)}
                  </span>
                </span>
              </div>
              <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${Math.max(2, Math.min(pct, 1) * 100)}%`,
                    backgroundColor: bar,
                  }}
                />
              </div>
              <span
                className={cn('text-[12px]', over ? 'text-danger' : 'text-ink-faint')}
              >
                {over
                  ? `${formatMoney(spent - t.monthlyBudget, currency)} over`
                  : `${formatMoney(t.monthlyBudget - spent, currency)} left`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
