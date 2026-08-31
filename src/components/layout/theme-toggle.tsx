'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // The server can't know the stored theme; render a stable value until mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const active = mounted ? (theme ?? 'system') : 'system';

  return (
    <div className="border-hairline bg-field flex rounded-lg border p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`${label} theme`}
          aria-pressed={active === value}
          className={cn(
            'flex size-7 items-center justify-center rounded-md transition-colors',
            active === value ? 'bg-surface-2 text-ink' : 'text-ink-faint hover:text-ink',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
