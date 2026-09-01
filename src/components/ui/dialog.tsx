'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="animate-overlay-in data-[state=closed]:animate-overlay-out fixed inset-0 z-40 backdrop-blur-[2px]"
        style={{ backgroundColor: 'var(--backdrop)' }}
      />
      <RadixDialog.Content
        className={cn(
          'animate-dialog-in data-[state=closed]:animate-dialog-out fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
          'border-hairline bg-overlay shadow-modal rounded-2xl border p-5 focus:outline-none',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="text-ink font-serif text-[17px] font-semibold">
              {title}
            </RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="text-ink-muted mt-0.5 text-sm">
                {description}
              </RadixDialog.Description>
            ) : null}
          </div>
          <RadixDialog.Close
            className="text-ink-faint hover:bg-surface-2 hover:text-ink -m-1 shrink-0 rounded-lg p-1 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
