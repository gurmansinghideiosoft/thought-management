import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';

import { AppBackground } from '@/components/layout/app-background';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Margin',
  description:
    'Room to think — your tasks, notes, and journal, set down so your mind doesn’t have to hold them.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${serif.variable} h-full`}
    >
      <body className="text-ink flex min-h-full flex-col">
        <Providers>
          <AppBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
