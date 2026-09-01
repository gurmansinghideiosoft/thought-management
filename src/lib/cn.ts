import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class strings, resolving conflicts (last wins). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
