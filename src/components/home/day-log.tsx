'use client';

import { Check, Copy, NotebookPen, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  useAddLogEntryMutation,
  useDeleteLogEntryMutation,
  useListLogQuery,
  useUpdateLogEntryMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { toDateKey } from '@/lib/date';
import { clockTime } from '@/lib/format';
import type { LogEntry } from '@/lib/types';

export function DayLog() {
  const today = toDateKey(new Date());
  const { data, isLoading } = useListLogQuery(today);
  const [add, { isLoading: adding }] = useAddLogEntryMutation();
  const [update] = useUpdateLogEntryMutation();
  const [remove] = useDeleteLogEntryMutation();
  const toast = useToast();

  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const items = data?.items ?? [];

  const submit = async () => {
    const value = text.trim();
    if (!value || adding) return;
    try {
      await add({ text: value, date: today }).unwrap();
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add that'));
    }
  };

  const copyAll = async () => {
    if (items.length === 0) return;
    try {
      await navigator.clipboard.writeText(items.map((i) => `- ${i.text}`).join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  const saveEdit = async (entry: LogEntry) => {
    const value = draft.trim();
    setEditingId(null);
    if (!value || value === entry.text) return;
    try {
      await update({ id: entry.id, text: value }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const del = async (id: string) => {
    try {
      await remove(id).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete'));
    }
  };

  return (
    <section className="border-hairline bg-surface flex flex-col rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink flex items-center gap-2 font-serif text-[15px] font-semibold">
          <NotebookPen size={16} className="text-ink-faint" />
          Today&rsquo;s log
          {items.length > 0 ? (
            <span className="text-ink-faint text-[12px] font-normal tabular-nums">
              {items.length}
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={items.length === 0}
          className="text-ink-faint hover:text-ink inline-flex items-center gap-1 text-[12px] transition-colors disabled:opacity-40"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows bare rows={3} />
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-ink-faint py-3 text-center text-sm">
              Nothing logged yet — jot notes as you work, then copy them out at the end of
              the day.
            </p>
          ) : (
            <ul className="flex flex-col">
              {items.map((entry) => (
                <li key={entry.id} className="group flex items-start gap-2.5 py-1">
                  <span className="text-ink-faint mt-[3px] shrink-0 text-[11px] tabular-nums">
                    {clockTime(entry.createdAt)}
                  </span>
                  {editingId === entry.id ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => void saveEdit(entry)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void saveEdit(entry);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="border-hairline bg-field text-ink min-w-0 flex-1 rounded border px-1.5 py-0.5 text-[13.5px] focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(entry.id);
                        setDraft(entry.text);
                      }}
                      className="text-ink min-w-0 flex-1 text-left text-[13.5px] leading-snug"
                    >
                      {entry.text}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Delete entry"
                    onClick={() => void del(entry.id)}
                    className="text-ink-faint hover:text-danger mt-[3px] shrink-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-hairline mt-3 border-t pt-3">
            <Input
              ref={inputRef}
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
          </div>
        </>
      )}
    </section>
  );
}
