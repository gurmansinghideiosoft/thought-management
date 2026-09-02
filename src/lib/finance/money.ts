/** Format a number as money in the given ISO 4217 currency. */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    // Unknown / malformed code — fall back to a plain grouped number.
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${currency}`;
  }
}

/** Parse a user-typed amount ("12", "12.5", "1,234.50") to a positive number,
 * or `null` if it isn't a usable value. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s,]/g, '');
  if (!cleaned || !/^\d*\.?\d*$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CAD',
  'AUD',
  'JPY',
  'SGD',
  'AED',
] as const;
