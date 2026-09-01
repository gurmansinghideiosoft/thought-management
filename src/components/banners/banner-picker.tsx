'use client';

import { Check, ImageOff } from 'lucide-react';
import Image from 'next/image';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { BANNERS } from '@/lib/banners';
import { cn } from '@/lib/cn';

export function BannerPicker({
  value,
  onSelect,
  trigger,
  title = 'Choose a background',
  allowDefault = true,
}: {
  value: string | null;
  onSelect: (id: string | null) => void;
  trigger: React.ReactNode;
  title?: string;
  allowDefault?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} className="max-w-2xl">
        <div className="grid max-h-[65vh] grid-cols-2 gap-2 overflow-y-auto p-0.5 sm:grid-cols-3">
          {allowDefault ? (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={cn(
                'border-hairline bg-surface-2 text-ink-muted flex aspect-video items-center justify-center gap-1.5 rounded-lg border text-[12px] transition-colors',
                value == null ? 'ring-accent ring-2' : 'hover:bg-surface-3',
              )}
            >
              <ImageOff size={14} /> Default
            </button>
          ) : null}
          {BANNERS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={cn(
                'group border-hairline relative aspect-video overflow-hidden rounded-lg border transition-transform hover:scale-[1.02]',
                value === b.id ? 'ring-accent ring-2' : '',
              )}
              title={b.label}
            >
              <Image
                src={b.thumb}
                alt={b.label}
                fill
                sizes="240px"
                className="object-cover"
              />
              {value === b.id ? (
                <span className="bg-accent text-accent-fg absolute top-1 right-1 grid size-5 place-items-center rounded-full">
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : null}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-left text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {b.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
