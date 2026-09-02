'use client';

import { addDays } from 'date-fns';
import { Check, Plus } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCreateTaskMutation, useSaveReviewMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import { fromDateKey, toDateKey } from '@/lib/date';
import type { ReviewPeriod, SavedReview } from '@/lib/types';

export interface ReflectionFormHandle {
  focusReflection: () => void;
}

export const ReflectionForm = forwardRef<
  ReflectionFormHandle,
  {
    period: ReviewPeriod;
    periodKey: string;
    /** Last day of the period — intentions become tasks on the day after. */
    rangeTo: string;
    saved: SavedReview | null;
  }
>(function ReflectionForm({ period, periodKey, rangeTo, saved }, ref) {
  const toast = useToast();
  const [save, { isLoading }] = useSaveReviewMutation();
  const [createTask] = useCreateTaskMutation();
  const reflRef = useRef<HTMLTextAreaElement>(null);

  const [reflection, setReflection] = useState(saved?.reflection ?? '');
  const [intentions, setIntentions] = useState(saved?.intentions ?? '');
  const [rating, setRating] = useState<number | null>(saved?.rating ?? null);
  const [justSaved, setJustSaved] = useState(false);

  const completed = Boolean(saved?.completedAt);
  const nextDate = toDateKey(addDays(fromDateKey(rangeTo), 1));

  useImperativeHandle(ref, () => ({
    focusReflection: () => reflRef.current?.focus(),
  }));

  const persist = async (extra: { rating?: number | null; completed?: boolean } = {}) => {
    try {
      await save({
        period,
        periodKey,
        reflection,
        intentions,
        rating,
        ...extra,
      }).unwrap();
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
      if (extra.completed) {
        toast.success(`${period === 'week' ? 'Week' : 'Month'} reviewed. Onward.`);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save'));
    }
  };

  const lines = intentions
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const toTask = async (content: string) => {
    try {
      await createTask({ content, date: nextDate }).unwrap();
      toast.success('Added to Tasks');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add task'));
    }
  };

  return (
    <div className="border-hairline bg-surface flex flex-col gap-5 rounded-xl border p-5">
      <div>
        <label
          htmlFor="review-reflection"
          className="text-ink-faint mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
        >
          How did this {period} go?
        </label>
        <Textarea
          id="review-reflection"
          ref={reflRef}
          rows={4}
          placeholder="Wins, snags, what you learned…"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={() => void persist()}
        />
      </div>

      <div>
        <label
          htmlFor="review-intentions"
          className="text-ink-faint mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
        >
          What matters next {period}?
        </label>
        <Textarea
          id="review-intentions"
          rows={3}
          placeholder="One intention per line…"
          value={intentions}
          onChange={(e) => setIntentions(e.target.value)}
          onBlur={() => void persist()}
        />
        {lines.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1">
            {lines.map((line, i) => (
              <li key={`${i}-${line}`} className="flex items-center gap-2 text-[13px]">
                <span className="text-ink-muted min-w-0 flex-1 truncate">{line}</span>
                <button
                  type="button"
                  onClick={() => void toTask(line)}
                  className="text-ink-faint hover:text-accent inline-flex shrink-0 items-center gap-1 text-[12px] font-medium"
                >
                  <Plus size={12} /> Task
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-ink-faint text-[11px] font-medium tracking-wide uppercase">
          How did it feel?
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              onClick={() => {
                const next = rating === n ? null : n;
                setRating(next);
                void persist({ rating: next });
              }}
              className={cn(
                'size-6 rounded-full border text-[12px] transition-colors',
                rating !== null && n <= rating
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-hairline text-ink-faint hover:border-accent/50',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={isLoading}
          onClick={() => void persist()}
        >
          {justSaved ? (
            <>
              <Check size={14} /> Saved
            </>
          ) : (
            'Save'
          )}
        </Button>
        <Button size="sm" onClick={() => void persist({ completed: !completed })}>
          {completed ? 'Reopen review' : 'Complete review'}
        </Button>
      </div>
    </div>
  );
});
