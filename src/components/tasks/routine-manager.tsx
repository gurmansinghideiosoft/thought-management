'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useAddRoutineItemMutation,
  useGetRoutineQuery,
  useRemoveRoutineItemMutation,
  useReorderRoutineItemsMutation,
  useUpdateRoutineItemMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { Priority } from '@/lib/priority';
import type { RoutineItem } from '@/lib/types';
import { PrioritySelect } from './priority';

export function RoutineManager({ trigger }: { trigger: React.ReactNode }) {
  const toast = useToast();
  const { data: items = [], isLoading } = useGetRoutineQuery();
  const [addItem, { isLoading: adding }] = useAddRoutineItemMutation();
  const [reorder] = useReorderRoutineItemsMutation();

  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(3);

  const add = async () => {
    if (!content.trim()) return;
    try {
      await addItem({ content: content.trim(), priority }).unwrap();
      setContent('');
      setPriority(3);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the item'));
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorder(next.map((i) => i.id)).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not reorder'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Daily routine"
        description="These tasks appear on every day from today onward. Changes never touch past days."
        className="max-w-lg"
      >
        {isLoading ? (
          <CenteredSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {items.map((item, i) => (
                <RoutineRow
                  key={item.id}
                  item={item}
                  first={i === 0}
                  last={i === items.length - 1}
                  onMoveUp={() => void move(i, -1)}
                  onMoveDown={() => void move(i, 1)}
                />
              ))}
              {items.length === 0 ? (
                <p className="text-ink-faint py-2 text-center text-sm">
                  No routine yet — add your first daily task below.
                </p>
              ) : null}
            </div>

            <div className="border-hairline flex items-center gap-2 border-t pt-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="Add a daily task…"
                maxLength={500}
                className="border-hairline bg-field text-ink placeholder:text-ink-faint focus:border-accent/55 focus:ring-accent/20 h-9 flex-1 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
              />
              <PrioritySelect value={priority} onChange={setPriority} />
              <Button size="sm" className="h-9" onClick={add} loading={adding}>
                <Plus size={15} />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RoutineRow({
  item,
  first,
  last,
  onMoveUp,
  onMoveDown,
}: {
  item: RoutineItem;
  first: boolean;
  last: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const toast = useToast();
  const [updateItem] = useUpdateRoutineItemMutation();
  const [removeItem] = useRemoveRoutineItemMutation();
  const [draft, setDraft] = useState(item.content);
  const dirty = draft.trim() !== item.content && draft.trim().length > 0;

  const rename = () => {
    if (dirty) void updateItem({ id: item.id, content: draft.trim() });
  };

  return (
    <div className="border-hairline bg-surface flex items-center gap-1.5 rounded-lg border px-2 py-1.5">
      <div className="flex flex-col">
        <IconButton
          label="Move up"
          disabled={first}
          onClick={onMoveUp}
          className="size-5"
        >
          <ArrowUp size={12} />
        </IconButton>
        <IconButton
          label="Move down"
          disabled={last}
          onClick={onMoveDown}
          className="size-5"
        >
          <ArrowDown size={12} />
        </IconButton>
      </div>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={rename}
        onKeyDown={(e) => e.key === 'Enter' && rename()}
        className="text-ink min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
      />

      <PrioritySelect
        value={item.priority}
        onChange={(p) => void updateItem({ id: item.id, priority: p })}
      />

      <IconButton
        label="Remove from routine"
        onClick={async () => {
          try {
            await removeItem(item.id).unwrap();
          } catch (err) {
            toast.error(errorMessage(err, 'Could not remove the item'));
          }
        }}
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}
