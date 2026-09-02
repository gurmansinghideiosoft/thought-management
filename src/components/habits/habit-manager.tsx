'use client';

import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useCreateHabitMutation,
  useDeleteHabitMutation,
  useListHabitsQuery,
  useReorderHabitsMutation,
  useUpdateHabitMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type { Habit, HabitType } from '@/lib/types';

type HabitPatch = {
  name?: string;
  type?: HabitType;
  target?: number;
  unit?: string;
  color?: string;
  archived?: boolean;
};

const SWATCHES = ['#3f7d58', '#c96442', '#3b6ea5', '#8a5cf6', '#c2410c', '#6f6d65'];

function Swatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          className="grid size-5 place-items-center rounded-full"
          aria-label={`Colour ${c}`}
        >
          {value === c ? <Check size={11} className="text-white" /> : null}
        </button>
      ))}
    </div>
  );
}

function TypeToggle({
  value,
  onChange,
}: {
  value: HabitType;
  onChange: (t: HabitType) => void;
}) {
  return (
    <div className="border-hairline bg-surface flex shrink-0 rounded-lg border p-0.5">
      {(
        [
          ['binary', 'Yes / no'],
          ['count', 'Count'],
        ] as const
      ).map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            'h-7 rounded-md px-2 text-[12px] transition-colors',
            value === v
              ? 'bg-surface-2 text-ink font-medium'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function HabitManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: habits, isLoading } = useListHabitsQuery({ includeArchived: true });
  const [reorder] = useReorderHabitsMutation();
  const toast = useToast();

  const ordered = [...(habits ?? [])].sort((a, b) => a.position - b.position);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...ordered];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    void reorder(next.map((h) => h.id))
      .unwrap()
      .catch(() => toast.error('Could not reorder'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Manage habits"
        description="A count habit is “done” once its daily total reaches the target."
        className="max-w-2xl"
      >
        {isLoading ? (
          <CenteredSpinner />
        ) : (
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              {ordered.map((h, i) => (
                <HabitManagerRow
                  key={h.id}
                  habit={h}
                  isFirst={i === 0}
                  isLast={i === ordered.length - 1}
                  onMove={(dir) => move(i, dir)}
                />
              ))}
              {ordered.length === 0 ? (
                <p className="text-ink-faint py-2 text-center text-sm">No habits yet</p>
              ) : null}
            </div>
            <div className="border-hairline border-t pt-3">
              <AddForm />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function HabitManagerRow({
  habit,
  isFirst,
  isLast,
  onMove,
}: {
  habit: Habit;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  const toast = useToast();
  const [update] = useUpdateHabitMutation();
  const [remove] = useDeleteHabitMutation();
  const [name, setName] = useState(habit.name);
  const [target, setTarget] = useState(String(habit.target));
  const [unit, setUnit] = useState(habit.unit);

  const save = (patch: HabitPatch) =>
    update({ id: habit.id, ...patch })
      .unwrap()
      .catch((err) => toast.error(errorMessage(err, 'Could not save')));

  return (
    <div
      className={cn(
        'border-hairline bg-surface flex flex-wrap items-center gap-2 rounded-lg border p-2.5',
        habit.archived && 'opacity-55',
      )}
    >
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMove(-1)}
          className="text-ink-faint hover:text-ink disabled:opacity-30"
          aria-label="Move up"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMove(1)}
          className="text-ink-faint hover:text-ink disabled:opacity-30"
          aria-label="Move down"
        >
          <ArrowDown size={13} />
        </button>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() =>
          name.trim() && name.trim() !== habit.name && save({ name: name.trim() })
        }
        className="text-ink min-w-[7rem] flex-1 bg-transparent text-sm focus:outline-none"
      />
      <TypeToggle value={habit.type} onChange={(type) => save({ type })} />
      {habit.type === 'count' ? (
        <>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onBlur={() => {
              const n = Math.max(1, Math.round(Number(target) || 1));
              setTarget(String(n));
              if (n !== habit.target) save({ target: n });
            }}
            inputMode="numeric"
            aria-label="Daily target"
            className="border-hairline bg-field text-ink h-7 w-14 rounded-md border px-1 text-center text-[12px] tabular-nums focus:outline-none"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onBlur={() => unit.trim() !== habit.unit && save({ unit: unit.trim() })}
            placeholder="unit"
            aria-label="Unit"
            className="border-hairline bg-field text-ink placeholder:text-ink-faint h-7 w-16 rounded-md border px-2 text-[12px] focus:outline-none"
          />
        </>
      ) : null}
      <Swatches value={habit.color} onChange={(color) => save({ color })} />
      <label className="text-ink-faint flex items-center gap-1.5 text-[12px]">
        <Checkbox
          checked={habit.archived}
          onCheckedChange={(archived) => save({ archived })}
          aria-label="Archive"
        />
        Archived
      </label>
      <IconButton
        label={`Delete ${habit.name}`}
        onClick={() =>
          remove(habit.id)
            .unwrap()
            .catch(() => toast.error('Could not delete'))
        }
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}

function AddForm() {
  const toast = useToast();
  const [create, { isLoading }] = useCreateHabitMutation();
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('binary');
  const [target, setTarget] = useState('1');
  const [color, setColor] = useState(SWATCHES[0]);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await create({
        name: name.trim(),
        type,
        target: type === 'count' ? Math.max(1, Math.round(Number(target) || 1)) : 1,
        color,
      }).unwrap();
      setName('');
      setType('binary');
      setTarget('1');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the habit'));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
        placeholder="Meditate, Read, Water…"
        className="h-9 min-w-[7rem] flex-1"
        maxLength={60}
      />
      <TypeToggle value={type} onChange={setType} />
      {type === 'count' ? (
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          inputMode="numeric"
          aria-label="Daily target"
          className="border-hairline bg-field text-ink h-9 w-14 rounded-md border px-1 text-center text-[12px] tabular-nums focus:outline-none"
        />
      ) : null}
      <Swatches value={color} onChange={setColor} />
      <Button
        size="sm"
        className="h-9"
        onClick={add}
        loading={isLoading}
        disabled={!name.trim()}
      >
        <Plus size={15} />
      </Button>
    </div>
  );
}
