'use client';

import { useState } from 'react';

import { TagCombobox } from '@/components/finance/tag-combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  useCreateLoanMutation,
  useListFinanceTagsQuery,
  useRepayLoanMutation,
  useUpdateLoanMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/date';
import { formatMoney, parseAmount } from '@/lib/finance/money';
import type { LoanDirection, Transaction } from '@/lib/types';

const DIRECTIONS: { value: LoanDirection; label: string }[] = [
  { value: 'lent', label: 'I lent' },
  { value: 'borrowed', label: 'I borrowed' },
];

function DirectionToggle({
  value,
  onChange,
}: {
  value: LoanDirection;
  onChange: (v: LoanDirection) => void;
}) {
  return (
    <div className="border-hairline bg-surface flex rounded-lg border p-0.5">
      {DIRECTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'h-7 flex-1 rounded-md px-2 text-[12px] transition-colors',
            value === o.value
              ? 'bg-surface-2 text-ink font-medium'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// --- add ---------------------------------------------------------------

export function AddLoanDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setSession((s) => s + 1);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Record a loan"
        description="It books a real transaction so your balance stays honest, and lives in the loan space until it's paid back."
        className="max-w-sm"
      >
        <AddBody key={session} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AddBody({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();
  const { data: tags } = useListFinanceTagsQuery();
  const [create, { isLoading }] = useCreateLoanMutation();

  const [direction, setDirection] = useState<LoanDirection>('lent');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [dueDate, setDueDate] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const parsed = parseAmount(amount);
  const canSave = counterparty.trim().length > 0 && parsed !== null && !isLoading;

  const save = async () => {
    if (!canSave || parsed === null) return;
    try {
      await create({
        counterparty: counterparty.trim(),
        direction,
        amount: parsed,
        date,
        dueDate: dueDate || null,
        note: note.trim() || null,
        tagId,
      }).unwrap();
      toast.success(direction === 'lent' ? 'Loan recorded' : 'Debt recorded');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not record the loan'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[13px] font-medium">Direction</span>
        <DirectionToggle value={direction} onChange={setDirection} />
      </div>
      <Field
        label={
          direction === 'lent' ? 'Who borrowed from you?' : 'Who did you borrow from?'
        }
      >
        {({ id }) => (
          <Input
            id={id}
            autoFocus
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="Name"
            maxLength={80}
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount">
          {({ id }) => (
            <Input
              id={id}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          )}
        </Field>
        <Field label="Date">
          {({ id }) => (
            <Input
              id={id}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </Field>
      </div>
      <Field label="Due date" hint="Optional — when you expect it back">
        {({ id }) => (
          <Input
            id={id}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[13px] font-medium">Tag</span>
        <TagCombobox value={tagId} onChange={setTagId} tags={tags ?? []} />
      </div>
      <Field label="Note" hint="Optional">
        {({ id }) => (
          <Textarea
            id={id}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            className="min-h-[60px]"
          />
        )}
      </Field>
      <Button className="mt-1" onClick={save} loading={isLoading} disabled={!canSave}>
        Record loan
      </Button>
    </div>
  );
}

// --- repay -----------------------------------------------------------

export function RepayLoanDialog({
  loan,
  currency,
  open,
  onOpenChange,
}: {
  loan: Transaction;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Record a repayment" className="max-w-sm">
        {open ? (
          <RepayBody loan={loan} currency={currency} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RepayBody({
  loan,
  currency,
  onDone,
}: {
  loan: Transaction;
  currency: string;
  onDone: () => void;
}) {
  const toast = useToast();
  const [repay, { isLoading }] = useRepayLoanMutation();
  const outstanding = loan.amount;
  const lent = loan.loan?.direction === 'lent';

  const [amount, setAmount] = useState(String(outstanding));
  const [date, setDate] = useState(() => toDateKey(new Date()));

  const parsed = parseAmount(amount);
  const invalid = parsed === null || parsed > outstanding;
  const willSettle = parsed !== null && parsed >= outstanding;

  const submit = async () => {
    if (invalid || parsed === null) return;
    try {
      await repay({ id: loan.id, amount: parsed, date }).unwrap();
      toast.success(willSettle ? 'Loan settled' : 'Repayment recorded');
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not record the repayment'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-muted text-sm">
        {lent
          ? `${loan.loan?.counterparty} owes you `
          : `You owe ${loan.loan?.counterparty} `}
        <span className="text-ink font-medium tabular-nums">
          {formatMoney(outstanding, currency)}
        </span>{' '}
        right now.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Amount"
          error={
            parsed !== null && parsed > outstanding
              ? 'More than the outstanding balance'
              : undefined
          }
        >
          {({ id }) => (
            <Input
              id={id}
              autoFocus
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
        </Field>
        <Field label="Date">
          {({ id }) => (
            <Input
              id={id}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </Field>
      </div>
      <button
        type="button"
        onClick={() => setAmount(String(outstanding))}
        className="text-ink-muted hover:text-ink self-start text-[13px] font-medium"
      >
        Pay the full balance
      </button>
      <Button className="mt-1" onClick={submit} loading={isLoading} disabled={invalid}>
        {willSettle ? 'Record & settle' : 'Record repayment'}
      </Button>
    </div>
  );
}

// --- edit ------------------------------------------------------------

export function EditLoanDialog({
  loan,
  open,
  onOpenChange,
}: {
  loan: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Edit loan" className="max-w-sm">
        {open ? <EditBody loan={loan} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EditBody({ loan, onDone }: { loan: Transaction; onDone: () => void }) {
  const toast = useToast();
  const { data: tags } = useListFinanceTagsQuery();
  const [update, { isLoading }] = useUpdateLoanMutation();

  const [counterparty, setCounterparty] = useState(loan.loan?.counterparty ?? '');
  const [title, setTitle] = useState(loan.title);
  const [dueDate, setDueDate] = useState(loan.loan?.dueDate ?? '');
  const [note, setNote] = useState(loan.loan?.note ?? '');
  const [tagId, setTagId] = useState<string | null>(loan.tagId);

  const canSave = counterparty.trim().length > 0 && title.trim().length > 0 && !isLoading;

  const save = async () => {
    if (!canSave) return;
    try {
      await update({
        id: loan.id,
        counterparty: counterparty.trim(),
        title: title.trim(),
        dueDate: dueDate || null,
        note: note.trim() || null,
        tagId,
      }).unwrap();
      toast.success('Updated');
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Counterparty">
        {({ id }) => (
          <Input
            id={id}
            autoFocus
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            maxLength={80}
          />
        )}
      </Field>
      <Field label="Title" hint="How it reads in the transaction list">
        {({ id }) => (
          <Input
            id={id}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        )}
      </Field>
      <Field label="Due date" hint="Optional">
        {({ id }) => (
          <Input
            id={id}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[13px] font-medium">Tag</span>
        <TagCombobox value={tagId} onChange={setTagId} tags={tags ?? []} />
      </div>
      <Field label="Note" hint="Optional">
        {({ id }) => (
          <Textarea
            id={id}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            className="min-h-[60px]"
          />
        )}
      </Field>
      <Button className="mt-1" onClick={save} loading={isLoading} disabled={!canSave}>
        Save changes
      </Button>
    </div>
  );
}
