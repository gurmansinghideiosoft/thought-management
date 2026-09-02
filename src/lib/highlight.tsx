import type { ReactNode } from 'react';

/** Wrap every case-insensitive occurrence of `term` in `text` with a `<mark>`. */
export function highlightMatches(text: string, term: string): ReactNode {
  const q = term.trim();
  if (!q) return text;

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  let n = 0;

  while (i <= text.length) {
    const at = lower.indexOf(needle, i);
    if (at === -1) {
      out.push(text.slice(i));
      break;
    }
    if (at > i) out.push(text.slice(i, at));
    out.push(
      <mark key={n++} className="bg-accent/20 text-accent rounded-[2px] px-0.5">
        {text.slice(at, at + needle.length)}
      </mark>,
    );
    i = at + needle.length;
  }

  return <>{out}</>;
}
