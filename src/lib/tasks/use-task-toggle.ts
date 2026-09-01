'use client';

import { useToast } from '@/components/ui/toast';
import { useSetTaskStatusMutation, useSetVirtualTaskStatusMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { TaskView } from '@/lib/types';

/**
 * Flip a task between `pending` and `done`. A virtual routine / range-daily
 * occurrence is materialised via `setVirtualTaskStatus`; a stored row uses
 * `setTaskStatus`. Shows a toast and rethrows on failure so callers can roll
 * back optimistic UI.
 */
export function useTaskToggle() {
  const toast = useToast();
  const [setStatus] = useSetTaskStatusMutation();
  const [setVirtualStatus] = useSetVirtualTaskStatusMutation();

  return async (task: TaskView, next: 'pending' | 'done') => {
    const link = task.routineItemId
      ? { routineItemId: task.routineItemId }
      : task.rangeTaskId
        ? { rangeTaskId: task.rangeTaskId }
        : null;
    try {
      if (task.virtual && link) {
        await setVirtualStatus({ date: task.day, status: next, ...link }).unwrap();
      } else {
        await setStatus({ id: task.id, status: next }).unwrap();
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the task'));
      throw err;
    }
  };
}
