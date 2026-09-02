'use client';

import { MoreHorizontal, Plus, Repeat, Tags } from 'lucide-react';
import { useState } from 'react';

import { AddTransactionsDialog } from '@/components/finance/add-transactions-dialog';
import { BudgetsStrip } from '@/components/finance/budgets-strip';
import { FinanceTagManager } from '@/components/finance/finance-tag-manager';
import {
  defaultRange,
  FinanceRangePicker,
  type DateRange,
} from '@/components/finance/finance-range-picker';
import { RecurringManager } from '@/components/finance/recurring-manager';
import { SpendingByTag } from '@/components/finance/spending-by-tag';
import { TransactionList } from '@/components/finance/transaction-list';
import { PageHeader } from '@/components/layout/page-header';
import { Button, IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Select } from '@/components/ui/select';
import { useFinanceSummaryQuery, useMeQuery, useUpdateMeMutation } from '@/lib/api/api';
import { CURRENCIES, formatMoney } from '@/lib/finance/money';

export default function FinancePage() {
  const [range, setRange] = useState<DateRange>(() => defaultRange());
  const [tagsOpen, setTagsOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);

  const { data: me } = useMeQuery();
  const currency = me?.user.currency ?? 'USD';
  const [updateMe] = useUpdateMeMutation();

  const { data: summary, isLoading } = useFinanceSummaryQuery(range);
  const spending = summary?.totalSpending ?? 0;
  const earning = summary?.totalEarning ?? 0;
  const net = summary?.net ?? 0;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Finance"
        actions={
          <div className="flex items-center gap-2">
            <Select
              ariaLabel="Currency"
              value={currency}
              onValueChange={(c) => void updateMe({ currency: c })}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              className="h-8 text-[13px]"
            />
            <Dropdown>
              <DropdownTrigger asChild>
                <IconButton label="Finance settings">
                  <MoreHorizontal size={18} />
                </IconButton>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem
                  icon={<Tags size={14} />}
                  onSelect={() => setTagsOpen(true)}
                >
                  Tags &amp; budgets
                </DropdownItem>
                <DropdownItem
                  icon={<Repeat size={14} />}
                  onSelect={() => setRecurringOpen(true)}
                >
                  Recurring transactions
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
            <AddTransactionsDialog
              trigger={
                <Button size="sm">
                  <Plus size={14} />
                  Add transactions
                </Button>
              }
            />
          </div>
        }
      />

      <FinanceTagManager open={tagsOpen} onOpenChange={setTagsOpen} />
      <RecurringManager open={recurringOpen} onOpenChange={setRecurringOpen} />

      <FinanceRangePicker value={range} onChange={setRange} />

      <div className="content-column flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Tile
            label="Spending"
            value={formatMoney(spending, currency)}
            loading={isLoading}
          />
          <Tile
            label="Earnings"
            value={formatMoney(earning, currency)}
            loading={isLoading}
            accent
          />
        </div>
        <p className="text-ink-muted mt-2 text-[13px]">
          Net{' '}
          <span className={net < 0 ? 'text-danger font-medium' : 'text-ink font-medium'}>
            {net < 0 ? '−' : ''}
            {formatMoney(Math.abs(net), currency)}
          </span>{' '}
          over {summary?.count ?? 0} transaction{summary?.count === 1 ? '' : 's'}
        </p>

        <BudgetsStrip currency={currency} />

        <section className="mt-8">
          <h2 className="text-ink mb-3 font-serif text-lg font-semibold">
            Where it went
          </h2>
          <SpendingByTag
            byTag={summary?.byTag ?? []}
            total={spending}
            currency={currency}
          />
        </section>

        <section className="mt-8">
          <h2 className="text-ink mb-3 font-serif text-lg font-semibold">Transactions</h2>
          <TransactionList from={range.from} to={range.to} currency={currency} />
        </section>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="border-hairline bg-surface flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-ink-faint text-[11px] font-medium tracking-wide uppercase">
        {label}
      </span>
      {loading ? (
        <span className="bg-surface-2 h-6 w-24 animate-pulse rounded-md motion-reduce:animate-none" />
      ) : (
        <span
          className={`text-xl font-semibold tabular-nums ${accent ? 'text-success' : 'text-ink'}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
