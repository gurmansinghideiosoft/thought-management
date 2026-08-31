'use client';

import { format } from 'date-fns';
import { ArrowLeft, Check, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useRef, useState } from 'react';

import { JournalEditor } from '@/components/journal/editor';
import { IconButton } from '@/components/ui/button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { CenteredSpinner, EmptyState } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useDeleteJournalEntryMutation,
  useGetJournalEntryQuery,
  useUpdateJournalEntryMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { fromDateKey } from '@/lib/date';
import type { JournalContent } from '@/lib/types';

type SaveState = 'idle' | 'saving' | 'saved';

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export default function JournalEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const { data: entry, isLoading, isError } = useGetJournalEntryQuery(id);
  const [updateEntry] = useUpdateJournalEntryMutation();
  const [deleteEntry] = useDeleteJournalEntryMutation();

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const latest = useRef<{ content?: JournalContent; text: string }>({ text: '' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (!entry) return;
    setSaveState('saving');
    try {
      const text = latest.current.text;
      await updateEntry({
        id: entry.id,
        title: titleRef.current?.value.trim() ?? entry.title,
        ...(latest.current.content ? { content: latest.current.content } : {}),
        excerpt: text.replace(/\s+/g, ' ').trim().slice(0, 280),
        wordCount: countWords(text),
      }).unwrap();
      setSaveState('saved');
    } catch (err) {
      setSaveState('idle');
      toast.error(errorMessage(err, 'Could not save'));
    }
  }, [entry, updateEntry, toast]);

  const scheduleSave = useCallback(() => {
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 900);
  }, [flush]);

  if (isLoading) return <CenteredSpinner />;
  if (isError || !entry) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState title="Entry not found" description="It may have been deleted." />
      </div>
    );
  }

  const day = fromDateKey(entry.date);

  return (
    <div className="bg-canvas fixed inset-0 z-40 flex flex-col overflow-y-auto">
      <header className="border-border bg-canvas/85 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-[680px] items-center gap-3 px-5 py-3">
          <IconButton label="Back to journal" onClick={() => router.push('/journal')}>
            <ArrowLeft size={18} />
          </IconButton>
          <div className="text-ink-muted flex-1 text-center text-[13px]">
            {format(day, 'EEEE, MMMM d, yyyy')}
          </div>
          <span className="text-ink-faint flex items-center gap-1.5 text-[12px]">
            {saveState === 'saving' ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Saving
              </>
            ) : saveState === 'saved' ? (
              <>
                <Check size={12} /> Saved
              </>
            ) : null}
          </span>
          <Dropdown>
            <DropdownTrigger asChild>
              <IconButton label="Entry actions">
                <MoreHorizontal size={18} />
              </IconButton>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem
                danger
                icon={<Trash2 size={15} />}
                onSelect={async () => {
                  try {
                    await deleteEntry(entry.id).unwrap();
                    router.push('/journal');
                  } catch (err) {
                    toast.error(errorMessage(err, 'Could not delete'));
                  }
                }}
              >
                Delete entry
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[680px] flex-1 px-5 pt-10 pb-40">
        <textarea
          ref={titleRef}
          defaultValue={entry.title}
          rows={1}
          placeholder={format(day, 'MMMM d')}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
            scheduleSave();
          }}
          className="text-ink placeholder:text-ink-faint mb-4 w-full resize-none bg-transparent text-3xl leading-tight font-bold focus:outline-none"
        />

        <JournalEditor
          key={entry.id}
          initialContent={entry.content}
          onChange={(content, text) => {
            latest.current = { content, text };
            scheduleSave();
          }}
        />
      </div>
    </div>
  );
}
