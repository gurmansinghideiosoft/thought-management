'use client';

import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Provider } from 'react-redux';

import { ToastProvider } from '@/components/ui/toast';
import { makeStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  // `useState` with an initializer builds the store exactly once per client.
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}
