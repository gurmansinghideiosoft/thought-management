/**
 * The single place that reads/writes auth tokens in `localStorage`.
 *
 * Every access is guarded — private-mode browsers and SSR both make this throw
 * or be undefined, and callers must still work with `null`.
 */
const ACCESS_KEY = 'tm.accessToken';
const REFRESH_KEY = 'tm.refreshToken';

const read = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — nothing we can do */
  }
};

const remove = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const tokenStore = {
  getAccess: (): string | null => read(ACCESS_KEY),
  getRefresh: (): string | null => read(REFRESH_KEY),
  set: (accessToken: string, refreshToken: string): void => {
    write(ACCESS_KEY, accessToken);
    write(REFRESH_KEY, refreshToken);
  },
  clear: (): void => {
    remove(ACCESS_KEY);
    remove(REFRESH_KEY);
  },
  hasSession: (): boolean => read(ACCESS_KEY) !== null,
};
