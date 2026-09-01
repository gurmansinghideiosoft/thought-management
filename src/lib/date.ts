import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

/** `YYYY-MM-DD` for a Date, in local time (no UTC shift). */
export const toDateKey = (d: Date): string => format(d, 'yyyy-MM-dd');

/** `YYYY-MM` for a Date. */
export const toMonthKey = (d: Date): string => format(d, 'yyyy-MM');

/** Parse a `YYYY-MM-DD` key back to a local Date. */
export const fromDateKey = (key: string): Date => parse(key, 'yyyy-MM-dd', new Date());

export const fromMonthKey = (key: string): Date => parse(key, 'yyyy-MM', new Date());

export const shiftMonth = (monthKey: string, by: number): string =>
  toMonthKey(addMonths(fromMonthKey(monthKey), by));

export interface CalendarDay {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
}

/** 6 weeks × 7 days covering `monthKey`, Monday-first. */
export const monthGrid = (monthKey: string): CalendarDay[] => {
  const month = fromMonthKey(monthKey);
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    key: toDateKey(date),
    inMonth: isSameMonth(date, month),
    isToday: isToday(date),
  }));
};

export const monthRange = (monthKey: string): { from: string; to: string } => {
  const month = fromMonthKey(monthKey);
  return { from: toDateKey(startOfMonth(month)), to: toDateKey(endOfMonth(month)) };
};

export const prettyMonth = (monthKey: string): string =>
  format(fromMonthKey(monthKey), 'MMMM yyyy');

export const prettyDay = (dateKey: string): string =>
  format(fromDateKey(dateKey), 'EEEE, MMMM d');

export const prettyDayShort = (dateKey: string): string => {
  const d = fromDateKey(dateKey);
  return `${format(d, 'EEE')} · ${format(d, 'MMM d')}${isToday(d) ? ' · today' : ''}`;
};

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
