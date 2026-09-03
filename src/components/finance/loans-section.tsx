'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  MoreHorizontal,
  Pencil,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  AddLoanDialog,
  EditLoanDialog,
  RepayLoanDialog,
} from '@/components/finance/loan-dialogs';
import { Button, IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useDeleteLoanMutation, useListLoansQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { prettyDayShort, toDateKey } from '@/lib/date';
import { formatMoney } from '@/lib/finance/money';
import type { LoanDirection, Transaction } from '@/lib/types';

export function LoansSection({ currency }: { currency: string }) {
  const { data: loans, isLoading } = useListLoansQuery({ status: 'all' });
  const toast = useToast();
  const [remove] = useDeleteLoanMutation();
  const [repaying, setRepaying] = useState<Transaction | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showSettled, setShowSettled] = useState(false);

  const { open, settled } = useMemo(() => {
    const o: Transaction[] = [];
    const s: Transaction[] = [];
    for (const l of loans ?? []) (l.loan?.status === 'settled' ? s : o).push(l);
    return { open: o, settled: s };
  }, [loans]);

  const lent = open.filter((l) => l.loan?.direction === 'lent');
  const borrowed = open.filter((l) => l.loan?.direction === 'borrowed');

  const del = async (l: Transaction) => {
    try {
      await remove(l.id).unwrap();
      toast.info('Removed');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove'));
    }
  };

  const addButton = (
    <AddLoanDialog
      trigger={
        <Button size="sm" variant="secondary">
          <HandCoins size={14} />
          Record a loan
        </Button>
      }
    />
  );

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-ink font-serif text-lg font-semibold">Loans</h2>
        {(loans ?? []).length > 0 ? addButton : null}
      </div>

      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : (loans ?? []).length === 0 ? (
        <EmptyState
          icon={<HandCoins size={22} />}
          title="No loans tracked"
          description="Money someone borrowed from you (or you borrowed) — recorded as a real transaction, kept here until it's paid back."
          action={addButton}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {lent.length > 0 ? (
            <LoanGroup
              label="Lent out"
              sublabel="owed to you"
              direction="lent"
              rows={lent}
              currency={currency}
              onRepay={setRepaying}
              onEdit={setEditing}
              onDelete={del}
            />
          ) : null}
          {borrowed.length > 0 ? (
            <LoanGroup
              label="Borrowed"
              sublabel="you owe"
              direction="borrowed"
              rows={borrowed}
              currency={currency}
              onRepay={setRepaying}
              onEdit={setEditing}
              onDelete={del}
            />
          ) : null}
          {open.length === 0 ? (
            <p className="text-ink-faint border-hairline rounded-xl border border-dashed px-4 py-6 text-center text-sm">
              Nothing outstanding — every loan is settled.
            </p>
          ) : null}

          {settled.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setShowSettled((v) => !v)}
                className="text-ink-muted hover:text-ink text-[13px] font-medium"
              >
                {showSettled ? 'Hide' : 'Show'} settled ({settled.length})
              </button>
              {showSettled ? (
                <ul className="border-hairline bg-surface divide-hairline mt-2 divide-y overflow-hidden rounded-xl border">
                  {settled.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-ink-muted truncate line-through">
                          {l.loan?.counterparty}
                        </p>
                        <p className="text-ink-faint text-[11px]">
                          {l.loan?.direction === 'lent' ? 'Lent' : 'Borrowed'}{' '}
                          {formatMoney(l.loan?.principal ?? 0, currency)}
                          {l.loan?.settledOn
                            ? ` · settled ${prettyDayShort(l.loan.settledOn)}`
                            : ''}
                        </p>
                      </div>
                      <IconButton
                        label={`Remove ${l.loan?.counterparty ?? 'loan'}`}
                        className="size-7"
                        onClick={() => void del(l)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {repaying ? (
        <RepayLoanDialog
          loan={repaying}
          currency={currency}
          open={repaying !== null}
          onOpenChange={(o) => !o && setRepaying(null)}
        />
      ) : null}
      {editing ? (
        <EditLoanDialog
          loan={editing}
          open={editing !== null}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      ) : null}
    </section>
  );
}

function LoanGroup({
  label,
  sublabel,
  direction,
  rows,
  currency,
  onRepay,
  onEdit,
  onDelete,
}: {
  label: string;
  sublabel: string;
  direction: LoanDirection;
  rows: Transaction[];
  currency: string;
  onRepay: (l: Transaction) => void;
  onEdit: (l: Transaction) => void;
  onDelete: (l: Transaction) => void;
}) {
  const total = rows.reduce((sum, l) => sum + l.amount, 0);
  const Icon = direction === 'lent' ? ArrowUpRight : ArrowDownLeft;
  const today = toDateKey(new Date());

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between px-1">
        <p className="text-ink-faint text-[11px] font-medium tracking-wide uppercase">
          {label} <span className="normal-case">· {sublabel}</span>
        </p>
        <span
          className={cn(
            'text-[13px] font-medium tabular-nums',
            direction === 'lent' ? 'text-success' : 'text-ink',
          )}
        >
          {formatMoney(total, currency)}
        </span>
      </div>
      <ul className="border-hairline bg-surface divide-hairline divide-y overflow-hidden rounded-xl border">
        {rows.map((l) => {
          const principal = l.loan?.principal ?? l.amount;
          const repaid = Math.max(0, principal - l.amount);
          const pct = principal > 0 ? repaid / principal : 0;
          const overdue =
            l.loan?.dueDate != null && l.loan.dueDate < today && l.amount > 0;
          return (
            <li key={l.id} className="group flex items-center gap-3 px-3 py-2.5 text-sm">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full',
                  direction === 'lent'
                    ? 'bg-success/12 text-success'
                    : 'bg-surface-2 text-ink-muted',
                )}
              >
                <Icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate">{l.loan?.counterparty}</p>
                <p className="text-ink-faint mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px]">
                  <span className="tabular-nums">
                    {formatMoney(l.amount, currency)} left
                  </span>
                  {repaid > 0 ? (
                    <span className="tabular-nums">
                      of {formatMoney(principal, currency)}
                    </span>
                  ) : null}
                  {l.loan?.dueDate ? (
                    <span className={overdue ? 'text-danger font-medium' : ''}>
                      {overdue ? 'overdue ' : 'due '}
                      {prettyDayShort(l.loan.dueDate)}
                    </span>
                  ) : null}
                </p>
                {repaid > 0 ? (
                  <div className="bg-surface-2 mt-1.5 h-1 overflow-hidden rounded-full">
                    <div
                      className="bg-success h-full rounded-full"
                      style={{ width: `${Math.min(100, pct * 100)}%` }}
                    />
                  </div>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => onRepay(l)}
              >
                Repay
              </Button>
              <Dropdown>
                <DropdownTrigger asChild>
                  <IconButton
                    label="Loan actions"
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
                  >
                    <MoreHorizontal size={15} />
                  </IconButton>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem icon={<Undo2 size={14} />} onSelect={() => onRepay(l)}>
                    Record repayment
                  </DropdownItem>
                  <DropdownItem icon={<Pencil size={14} />} onSelect={() => onEdit(l)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    danger
                    icon={<Trash2 size={14} />}
                    onSelect={() => onDelete(l)}
                  >
                    Delete
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
