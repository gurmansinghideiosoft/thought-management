export const PRIORITIES = [1, 2, 3, 4, 5] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'No chance to miss',
  2: 'Important',
  3: 'Valuable',
  4: 'Good to do',
  5: 'Can be skipped',
};

/** Short labels for filter chips. */
export const PRIORITY_SHORT: Record<Priority, string> = {
  1: 'Critical',
  2: 'Important',
  3: 'Valuable',
  4: 'Good to do',
  5: 'Skippable',
};

/** Warm → cool as urgency drops. */
export const PRIORITY_COLOR: Record<Priority, string> = {
  1: '#c0392b',
  2: '#d97706',
  3: '#c96442',
  4: '#3f7d58',
  5: '#8a8781',
};

export const isPriority = (n: number): n is Priority =>
  (PRIORITIES as readonly number[]).includes(n);
