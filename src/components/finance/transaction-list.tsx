'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Repeat,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { EditTransactionDialog } from '@/components/finance/edit-transaction-dialog';
import { EditLoanDialog, RepayLoanDialog } from '@/components/finance/loan-dialogs';
import { IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  useDeleteLoanMutation,
  useDeleteTransactionMutation,
  useListFinanceTagsQuery,
  useListTransactionsQuery,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { prettyDay } from '@/lib/date';
import { formatMoney } from '@/lib/finance/money';
import type { Transaction } from '@/lib/types';

export function TransactionList({
  from,
  to,
  currency,
}: {
  from: string;
  to: string;
  currency: string;
}) {
  const { data: items, isLoading } = useListTransactionsQuery({ from, to });
  const { data: tags } = useListFinanceTagsQuery();
  const toast = useToast();
  const [remove] = useDeleteTransactionMutation();
  const [removeLoan] = useDeleteLoanMutation();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editingLoan, setEditingLoan] = useState<Transaction | null>(null);
  const [repayingLoan, setRepayingLoan] = useState<Transaction | null>(null);

  const tagById = useMemo(() => new Map((tags ?? []).map((t) => [t.id, t])), [tags]);

  const groups = useMemo(() => {
    const out: { date: string; rows: Transaction[] }[] = [];
    for (const t of items ?? []) {
      const last = out.at(-1);
      if (last && last.date === t.date) last.rows.push(t);
      else out.push({ date: t.date, rows: [t] });
    }
    return out;
  }, [items]);

  if (isLoading) return <SkeletonRows rows={5} />;
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No transactions"
        description="Add some from the button up top — spending and earnings both count."
      />
    );
  }

  const del = async (t: Transaction) => {
    try {
      await (t.loan ? removeLoan(t.id) : remove(t.id)).unwrap();
      toast.info('Deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <div key={g.date} className="flex flex-col gap-1.5">
          <p className="text-ink-faint px-1 text-[11px] font-medium tracking-wide uppercase">
            {prettyDay(g.date)}
          </p>
          <ul className="border-hairline bg-surface divide-hairline divide-y overflow-hidden rounded-xl border">
            {g.rows.map((t) => {
              const tag = t.tagId ? tagById.get(t.tagId) : null;
              const earning = t.kind === 'earning';
              const loan = t.loan;
              const settled = loan?.status === 'settled';
              return (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-ink flex items-center gap-1.5 truncate">
                      {loan ? (
                        loan.direction === 'lent' ? (
                          <ArrowUpRight
                            size={12}
                            className="text-success shrink-0"
                            aria-label="Lent out"
                          />
                        ) : (
                          <ArrowDownLeft
                            size={12}
                            className="text-ink-faint shrink-0"
                            aria-label="Borrowed"
                          />
                        )
                      ) : t.recurringId ? (
                        <Repeat
                          size={12}
                          className="text-ink-faint shrink-0"
                          aria-label="Recurring"
                        />
                      ) : null}
                      <span className={cn('truncate', settled && 'line-through')}>
                        {t.title}
                      </span>
                    </p>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {tag ? (
                        <span className="text-ink-faint inline-flex items-center gap-1 text-[11px]">
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </span>
                      ) : null}
                      {loan ? (
                        <span className="text-ink-faint text-[11px]">
                          {settled
                            ? 'loan · settled'
                            : `${loan.direction === 'lent' ? 'lent' : 'borrowed'} · ${formatMoney(
                                t.amount,
                                currency,
                              )} left`}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 font-medium tabular-nums',
                      settled
                        ? 'text-ink-faint line-through'
                        : earning
                          ? 'text-success'
                          : 'text-ink',
                    )}
                  >
                    {earning ? '+' : ''}
                    {formatMoney(loan ? loan.principal : t.amount, currency)}
                  </span>
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <IconButton
                        label="Transaction actions"
                        className="size-7 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
                      >
                        <MoreHorizontal size={15} />
                      </IconButton>
                    </DropdownTrigger>
                    <DropdownContent>
                      {loan && !settled ? (
                        <DropdownItem
                          icon={<Undo2 size={14} />}
                          onSelect={() => setRepayingLoan(t)}
                        >
                          Record repayment
                        </DropdownItem>
                      ) : null}
                      <DropdownItem
                        icon={<Pencil size={14} />}
                        onSelect={() => (loan ? setEditingLoan(t) : setEditing(t))}
                      >
                        {loan ? 'Edit loan' : 'Edit'}
                      </DropdownItem>
                      <DropdownItem
                        danger
                        icon={<Trash2 size={14} />}
                        onSelect={() => void del(t)}
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
      ))}

      {editing ? (
        <EditTransactionDialog
          transaction={editing}
          open={editing !== null}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      ) : null}
      {editingLoan ? (
        <EditLoanDialog
          loan={editingLoan}
          open={editingLoan !== null}
          onOpenChange={(o) => !o && setEditingLoan(null)}
        />
      ) : null}
      {repayingLoan ? (
        <RepayLoanDialog
          loan={repayingLoan}
          currency={currency}
          open={repayingLoan !== null}
          onOpenChange={(o) => !o && setRepayingLoan(null)}
        />
      ) : null}
    </div>
  );
}
