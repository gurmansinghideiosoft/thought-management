'use client';

import { Quote as QuoteIcon } from 'lucide-react';

import { quoteOfTheDay } from '@/lib/home/quotes';

export function DailyQuote() {
  // `(app)` routes render server-side as a spinner, so resolving the date here
  // always reflects the viewer's local day.
  const quote = quoteOfTheDay();

  return (
    <section className="border-hairline bg-surface relative overflow-hidden rounded-xl border p-5">
      <QuoteIcon
        size={64}
        className="text-ink-faint/10 pointer-events-none absolute -top-2 -right-2"
        strokeWidth={1.5}
      />
      <p className="text-ink-faint mb-2 text-[11px] font-medium tracking-wide uppercase">
        Quote of the day
      </p>
      <blockquote className="text-ink font-serif text-[17px] leading-snug">
        “{quote.text}”
      </blockquote>
      <p className="text-ink-muted mt-2 text-[13px]">— {quote.author}</p>
    </section>
  );
}
