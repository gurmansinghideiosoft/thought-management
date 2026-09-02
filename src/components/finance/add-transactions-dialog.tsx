'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { KindToggle } from '@/components/finance/kind-toggle';
import { TagCombobox } from '@/components/finance/tag-combobox';
import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCreateTransactionsMutation, useListFinanceTagsQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { toDateKey } from '@/lib/date';
import { parseAmount } from '@/lib/finance/money';
import type { TransactionKind } from '@/lib/types';

interface Row {
  id: number;
  title: string;
  amount: string;
  kind: TransactionKind;
  tagId: string | null;
}

let nextRowId = 1;
const blankRow = (): Row => ({
  id: nextRowId++,
  title: '',
  amount: '',
  kind: 'spending',
  tagId: null,
});

export function AddTransactionsDialog({ trigger }: { trigger: React.ReactNode }) {
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
      <DialogContent title="Add transactions" className="max-w-xl">
        <Body key={session} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Body({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();
  const { data: tags } = useListFinanceTagsQuery();
  const [create, { isLoading }] = useCreateTransactionsMutation();

  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [rows, setRows] = useState<Row[]>(() => [blankRow(), blankRow(), blankRow()]);

  const patch = (id: number, next: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const valid = rows
    .map((r) => ({ r, amount: parseAmount(r.amount) }))
    .filter((x) => x.r.title.trim() && x.amount !== null);

  const save = async () => {
    if (valid.length === 0) return;
    try {
      await create({
        transactions: valid.map(({ r, amount }) => ({
          title: r.title.trim(),
          amount: amount as number,
          kind: r.kind,
          date,
          tagId: r.tagId,
        })),
      }).unwrap();
      toast.success(`Added ${valid.length}`);
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the transactions'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-[13px]">
        <span className="text-ink-muted font-medium">Date</span>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 w-auto"
        />
      </label>

      <div className="-mr-1 flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
        {rows.map((r) => (
          <div
            key={r.id}
            className="border-hairline bg-surface flex flex-wrap items-center gap-2 rounded-lg border p-2"
          >
            <Input
              value={r.title}
              onChange={(e) => patch(r.id, { title: e.target.value })}
              placeholder="What was it?"
              maxLength={120}
              className="h-9 min-w-[8rem] flex-1"
            />
            <Input
              value={r.amount}
              onChange={(e) => patch(r.id, { amount: e.target.value })}
              inputMode="decimal"
              placeholder="0.00"
              className="h-9 w-24 tabular-nums"
            />
            <KindToggle
              value={r.kind}
              onChange={(kind) => patch(r.id, { kind })}
              className="w-28"
            />
            <TagCombobox
              value={r.tagId}
              onChange={(tagId) => patch(r.id, { tagId })}
              tags={tags ?? []}
              className="w-36"
            />
            <IconButton
              label="Remove row"
              className="size-8"
              disabled={rows.length === 1}
              onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
            >
              <X size={14} />
            </IconButton>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, blankRow()])}
        className="border-hairline text-ink-muted hover:text-ink inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed px-2.5 py-1.5 text-[12px]"
      >
        <Plus size={13} /> Add row
      </button>

      <Button
        className="mt-1"
        onClick={save}
        loading={isLoading}
        disabled={valid.length === 0}
      >
        {valid.length === 0
          ? 'Add transactions'
          : `Save ${valid.length} transaction${valid.length === 1 ? '' : 's'}`}
      </Button>
    </div>
  );
}
