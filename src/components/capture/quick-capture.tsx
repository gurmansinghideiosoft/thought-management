'use client';

import Link from 'next/link';

import { CaptureComposer } from '@/components/capture/capture-composer';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function QuickCaptureDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Quick capture"
        description="Get it out of your head now — it lands in your Inbox to sort later."
        className="max-w-lg"
      >
        {open ? (
          <div className="flex flex-col gap-3">
            <CaptureComposer autoFocus minHeight="6rem" />
            <Link
              href="/inbox"
              onClick={() => onOpenChange(false)}
              className="text-ink-faint hover:text-ink self-start text-[12px]"
            >
              Open the Inbox →
            </Link>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
