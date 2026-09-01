/** Time-aware greeting + a personal nudge to write the day down. */

export function greeting(hour: number, name: string): string {
  const who = name ? `, ${name}` : '';
  if (hour < 5) return `Still up${who}`;
  if (hour < 12) return `Good morning${who}`;
  if (hour < 17) return `Good afternoon${who}`;
  if (hour < 21) return `Good evening${who}`;
  return `Winding down${who}`;
}

export function journalNudge(opts: {
  hour: number;
  name: string;
  currentStreak: number;
  writtenToday: boolean;
}): string {
  const { hour, currentStreak, writtenToday } = opts;
  const name = opts.name || 'friend';

  if (writtenToday) {
    return currentStreak > 1
      ? `Today's page is written — that's ${currentStreak} days in a row, ${name}.`
      : `Today's page is written. Rest easy, ${name}.`;
  }
  if (currentStreak >= 3) {
    return `${currentStreak} days without a gap, ${name}. Don't break the chain — write today.`;
  }
  if (currentStreak > 0) {
    return `You wrote yesterday, ${name}. Keep it going before the day slips away.`;
  }
  if (hour >= 21) {
    return `The day is almost gone, ${name}. Give it a few honest lines before sleep.`;
  }
  if (hour >= 17) {
    return `How did today treat you, ${name}? Put it into words while it's fresh.`;
  }
  return `A blank page is waiting, ${name}. Come back tonight and fill it in.`;
}
