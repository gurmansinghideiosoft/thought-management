'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAddLogEntryMutation, useListLogQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { toDateKey } from '@/lib/date';
import { clockTime } from '@/lib/format';

export function QuickLogDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Today's log"
        description="Jot what you just did — it lands in today's log on Home."
        className="max-w-lg"
      >
        {open ? <Body onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const today = toDateKey(new Date());
  const { data } = useListLogQuery(today);
  const [add, { isLoading }] = useAddLogEntryMutation();
  const toast = useToast();

  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const items = data?.items ?? [];

  const submit = async () => {
    const value = text.trim();
    if (!value || isLoading) return;
    try {
      await add({ text: value, date: today }).unwrap();
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add that'));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        ref={inputRef}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void submit();
          }
        }}
        placeholder="Just did… (Enter to add)"
        className="h-9"
      />

      {items.length > 0 ? (
        <ul className="max-h-56 overflow-y-auto">
          {items.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2.5 py-1 text-[13.5px]">
              <span className="text-ink-faint mt-[3px] shrink-0 text-[11px] tabular-nums">
                {clockTime(entry.createdAt)}
              </span>
              <span className="text-ink min-w-0 flex-1 leading-snug">{entry.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-faint text-center text-[13px]">
          Nothing logged yet today.
        </p>
      )}

      <Link
        href="/home"
        onClick={onClose}
        className="text-ink-faint hover:text-ink self-start text-[12px]"
      >
        Open Home →
      </Link>
    </div>
  );
}
