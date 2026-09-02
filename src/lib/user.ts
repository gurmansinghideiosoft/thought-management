import type { User } from './types';

/** The single uppercase letter shown as the avatar when there's no image. */
export const initials = (u: Pick<User, 'name' | 'username' | 'email'>): string =>
  (u.name.trim() || u.username || u.email).slice(0, 1).toUpperCase();
