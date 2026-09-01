'use client';

import * as Popover from '@radix-ui/react-popover';
import { RefreshCw, Wand2 } from 'lucide-react';
import { useState } from 'react';

import { IconButton } from '@/components/ui/button';
import { randomPassword } from '@/lib/vault/crypto';

/** A small "generate a strong value" popover, anchored to a field. */
export function PasswordGenerator({ onPick }: { onPick: (value: string) => void }) {
  const [length, setLength] = useState(20);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [preview, setPreview] = useState(() =>
    randomPassword({ length: 20, numbers: true, symbols: true }),
  );

  const roll = (l = length, n = numbers, s = symbols) =>
    setPreview(randomPassword({ length: l, numbers: n, symbols: s }));

  return (
    <Popover.Root onOpenChange={(open) => open && roll()}>
      <Popover.Trigger asChild>
        <IconButton label="Generate" className="size-8">
          <Wand2 size={14} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="border-hairline bg-overlay z-50 w-72 rounded-xl border p-3 shadow-xl shadow-black/15"
        >
          <div className="border-hairline bg-surface-2 flex items-center gap-2 rounded-lg border px-2.5 py-2">
            <code className="text-ink min-w-0 flex-1 truncate font-mono text-[12px]">
              {preview}
            </code>
            <IconButton label="Reroll" className="size-6" onClick={() => roll()}>
              <RefreshCw size={12} />
            </IconButton>
          </div>

          <label className="text-ink-muted mt-3 flex items-center justify-between text-[13px]">
            <span>Length</span>
            <span className="text-ink tabular-nums">{length}</span>
          </label>
          <input
            type="range"
            min={8}
            max={48}
            value={length}
            onChange={(e) => {
              const l = Number(e.target.value);
              setLength(l);
              roll(l);
            }}
            className="accent-accent mt-1 w-full"
          />

          <div className="mt-2 flex flex-col gap-1.5">
            <label className="text-ink-muted flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => {
                  setNumbers(e.target.checked);
                  roll(length, e.target.checked);
                }}
                className="accent-accent size-3.5"
              />
              Numbers
            </label>
            <label className="text-ink-muted flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => {
                  setSymbols(e.target.checked);
                  roll(length, numbers, e.target.checked);
                }}
                className="accent-accent size-3.5"
              />
              Symbols
            </label>
          </div>

          <Popover.Close asChild>
            <button
              onClick={() => onPick(preview)}
              className="bg-accent text-accent-fg mt-3 w-full rounded-lg py-1.5 text-[13px] font-medium hover:brightness-95"
            >
              Use this value
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
