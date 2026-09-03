'use client';

import Link from 'next/link';

import { AddTaskForm } from '@/components/tasks/add-task-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toDateKey } from '@/lib/date';

export function QuickTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const today = toDateKey(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Add a task for today"
        description="It shows up under Today on Home and in your task calendar."
        className="max-w-lg"
      >
        {open ? (
          <div className="flex flex-col gap-3">
            <AddTaskForm date={today} autoFocus />
            <Link
              href="/tasks"
              onClick={() => onOpenChange(false)}
              className="text-ink-faint hover:text-ink self-start text-[12px]"
            >
              Open Tasks →
            </Link>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
