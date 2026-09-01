'use client';

import * as Toast from '@radix-ui/react-toast';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const ICONS = { success: CheckCircle2, error: XCircle, info: Info } as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  // Radix animates the toast out on close; drop it from state once that's done.
  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string) => {
    setItems((prev) => [...prev.slice(-3), { id: nextId.current++, kind, message }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      <Toast.Provider swipeDirection="right" duration={4500}>
        {children}

        {items.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <Toast.Root
              key={t.id}
              onOpenChange={(open) => {
                if (!open) window.setTimeout(() => dismiss(t.id), 180);
              }}
              className={cn(
                'border-hairline bg-overlay shadow-popover flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
                'animate-toast-in data-[state=closed]:animate-toast-out',
                'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200',
                'data-[swipe=end]:animate-toast-out',
                t.kind === 'error' && 'border-danger/35',
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'mt-0.5 shrink-0',
                  t.kind === 'success' && 'text-accent',
                  t.kind === 'error' && 'text-danger',
                  t.kind === 'info' && 'text-ink-muted',
                )}
              />
              <Toast.Description className="text-ink flex-1 leading-snug">
                {t.message}
              </Toast.Description>
              <Toast.Close
                aria-label="Dismiss"
                className="text-ink-faint hover:text-ink mt-0.5 shrink-0 transition-colors"
              >
                <X size={14} />
              </Toast.Close>
            </Toast.Root>
          );
        })}

        <Toast.Viewport className="fixed right-0 bottom-0 z-[60] m-4 flex w-[min(100vw-2rem,24rem)] flex-col gap-2 outline-none max-sm:top-0 max-sm:bottom-auto max-sm:m-0 max-sm:w-full max-sm:p-3" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
