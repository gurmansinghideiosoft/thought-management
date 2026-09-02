'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { KindToggle } from '@/components/finance/kind-toggle';
import { TagCombobox } from '@/components/finance/tag-combobox';
import { Button, IconButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useCreateRecurringMutation,
  useDeleteRecurringMutation,
  useListFinanceTagsQuery,
  useListRecurringQuery,
  useUpdateRecurringMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { parseAmount } from '@/lib/finance/money';
import type { FinanceTag, RecurringTransaction, TransactionKind } from '@/lib/types';

type Patch = {
  title?: string;
  amount?: number;
  kind?: TransactionKind;
  tagId?: string | null;
  dayOfMonth?: number;
  active?: boolean;
};

const clampDay = (v: string): number =>
  Math.min(31, Math.max(1, Math.round(Number(v) || 1)));

export function RecurringManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: rules, isLoading } = useListRecurringQuery();
  const { data: tags } = useListFinanceTagsQuery();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Recurring transactions"
        description="Each posts automatically when its day of the month arrives."
        className="max-w-xl"
      >
        {isLoading ? (
          <CenteredSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {(rules ?? []).map((r) => (
                <RecurringRow key={r.id} rule={r} tags={tags ?? []} />
              ))}
              {(rules ?? []).length === 0 ? (
                <p className="text-ink-faint py-2 text-center text-sm">
                  No recurring rules yet
                </p>
              ) : null}
            </div>
            <div className="border-hairline border-t pt-3">
              <AddForm tags={tags ?? []} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecurringRow({
  rule,
  tags,
}: {
  rule: RecurringTransaction;
  tags: FinanceTag[];
}) {
  const toast = useToast();
  const [update] = useUpdateRecurringMutation();
  const [remove] = useDeleteRecurringMutation();
  const [title, setTitle] = useState(rule.title);
  const [amount, setAmount] = useState(String(rule.amount));
  const [day, setDay] = useState(String(rule.dayOfMonth));

  const save = (patch: Patch) =>
    update({ id: rule.id, ...patch })
      .unwrap()
      .catch((err) => toast.error(errorMessage(err, 'Could not save')));

  return (
    <div
      className={cn(
        'border-hairline bg-surface flex flex-wrap items-center gap-2 rounded-lg border p-2.5',
        !rule.active && 'opacity-60',
      )}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() =>
          title.trim() && title.trim() !== rule.title && save({ title: title.trim() })
        }
        className="text-ink min-w-[7rem] flex-1 bg-transparent text-sm focus:outline-none"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={() => {
          const a = parseAmount(amount);
          if (a !== null && a !== rule.amount) save({ amount: a });
          else setAmount(String(rule.amount));
        }}
        inputMode="decimal"
        className="border-hairline bg-field text-ink h-8 w-20 rounded-md border px-2 text-right text-[12px] tabular-nums focus:outline-none"
      />
      <KindToggle
        value={rule.kind}
        onChange={(kind) => save({ kind })}
        className="w-28"
      />
      <TagCombobox
        value={rule.tagId}
        onChange={(tagId) => save({ tagId })}
        tags={tags}
        className="w-32"
      />
      <label className="text-ink-faint flex items-center gap-1 text-[12px]">
        <span>on the</span>
        <input
          value={day}
          onChange={(e) => setDay(e.target.value)}
          onBlur={() => {
            const d = clampDay(day);
            setDay(String(d));
            if (d !== rule.dayOfMonth) save({ dayOfMonth: d });
          }}
          inputMode="numeric"
          className="border-hairline bg-field text-ink h-7 w-11 rounded-md border px-1 text-center tabular-nums focus:outline-none"
        />
      </label>
      <Checkbox
        checked={rule.active}
        onCheckedChange={(active) => save({ active })}
        aria-label={rule.active ? 'Pause this rule' : 'Resume this rule'}
      />
      <IconButton
        label={`Delete ${rule.title}`}
        onClick={() =>
          remove(rule.id)
            .unwrap()
            .catch(() => toast.error('Could not delete'))
        }
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}

function AddForm({ tags }: { tags: FinanceTag[] }) {
  const toast = useToast();
  const [create, { isLoading }] = useCreateRecurringMutation();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('spending');
  const [tagId, setTagId] = useState<string | null>(null);
  const [day, setDay] = useState('1');

  const parsed = parseAmount(amount);
  const canAdd = title.trim().length > 0 && parsed !== null;

  const add = async () => {
    if (!canAdd || parsed === null) return;
    try {
      await create({
        title: title.trim(),
        amount: parsed,
        kind,
        tagId,
        dayOfMonth: clampDay(day),
        active: true,
      }).unwrap();
      setTitle('');
      setAmount('');
      setTagId(null);
      setKind('spending');
      setDay('1');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the rule'));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Rent, Salary, Netflix…"
        className="h-9 min-w-[7rem] flex-1"
        maxLength={120}
      />
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        placeholder="0.00"
        className="h-9 w-20 tabular-nums"
      />
      <KindToggle value={kind} onChange={setKind} className="w-28" />
      <TagCombobox value={tagId} onChange={setTagId} tags={tags} className="w-32" />
      <label className="text-ink-faint flex items-center gap-1 text-[12px]">
        <span>on the</span>
        <input
          value={day}
          onChange={(e) => setDay(e.target.value)}
          inputMode="numeric"
          className="border-hairline bg-field text-ink h-7 w-11 rounded-md border px-1 text-center tabular-nums focus:outline-none"
        />
      </label>
      <Button
        size="sm"
        className="h-9"
        onClick={add}
        loading={isLoading}
        disabled={!canAdd}
      >
        <Plus size={15} />
      </Button>
    </div>
  );
}
