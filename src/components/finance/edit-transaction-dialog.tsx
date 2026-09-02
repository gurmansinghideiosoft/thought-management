'use client';

import { useState } from 'react';

import { KindToggle } from '@/components/finance/kind-toggle';
import { TagCombobox } from '@/components/finance/tag-combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useListFinanceTagsQuery, useUpdateTransactionMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { parseAmount } from '@/lib/finance/money';
import type { Transaction, TransactionKind } from '@/lib/types';

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Edit transaction" className="max-w-sm">
        {open ? (
          <EditForm transaction={transaction} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  transaction,
  onDone,
}: {
  transaction: Transaction;
  onDone: () => void;
}) {
  const toast = useToast();
  const { data: tags } = useListFinanceTagsQuery();
  const [update, { isLoading }] = useUpdateTransactionMutation();

  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [kind, setKind] = useState<TransactionKind>(transaction.kind);
  const [date, setDate] = useState(transaction.date);
  const [tagId, setTagId] = useState<string | null>(transaction.tagId);

  const parsed = parseAmount(amount);
  const canSave = title.trim().length > 0 && parsed !== null && !isLoading;

  const save = async () => {
    if (!canSave || parsed === null) return;
    try {
      await update({
        id: transaction.id,
        title: title.trim(),
        amount: parsed,
        kind,
        date,
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
      <Field label="Title">
        {({ id }) => (
          <Input
            id={id}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
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
      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[13px] font-medium">Type</span>
        <KindToggle value={kind} onChange={setKind} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[13px] font-medium">Tag</span>
        <TagCombobox value={tagId} onChange={setTagId} tags={tags ?? []} />
      </div>
      <Button className="mt-1" onClick={save} loading={isLoading} disabled={!canSave}>
        Save changes
      </Button>
    </div>
  );
}
