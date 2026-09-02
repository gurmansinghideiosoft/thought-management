'use client';

import { CornerDownLeft } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCreateCaptureMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

export function CaptureComposer({
  autoFocus,
  onSaved,
  minHeight = '7rem',
}: {
  autoFocus?: boolean;
  /** Fired after a successful save; the composer has already cleared itself. */
  onSaved?: () => void;
  minHeight?: string;
}) {
  const toast = useToast();
  const [create, { isLoading }] = useCreateCaptureMutation();
  const [text, setText] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const save = async () => {
    const value = text.trim();
    if (!value || isLoading) return;
    try {
      await create({ text: value }).unwrap();
      setText('');
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1600);
      ref.current?.focus();
      onSaved?.();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save that'));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={ref}
        autoFocus={autoFocus}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (justSaved) setJustSaved(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void save();
          }
        }}
        placeholder="What's on your mind? Anything at all — you can sort it later."
        className="resize-y leading-relaxed"
        style={{ minHeight }}
      />
      <div className="flex items-center justify-between">
        <span className="text-ink-faint text-[12px]">
          {justSaved ? (
            <span className="text-success">Saved — keep going</span>
          ) : (
            <>
              <kbd className="text-ink-muted font-sans">Enter</kbd> to save ·{' '}
              <kbd className="text-ink-muted font-sans">Shift+Enter</kbd> for a line
            </>
          )}
        </span>
        <Button
          size="sm"
          onClick={() => void save()}
          loading={isLoading}
          disabled={!text.trim()}
        >
          <CornerDownLeft size={14} />
          Capture
        </Button>
      </div>
    </div>
  );
}
