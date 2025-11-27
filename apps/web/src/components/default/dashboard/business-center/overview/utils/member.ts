const INITIALS_MAX_LENGTH = 2;

/**
 * Extracts initials from a name string.
 * Handles edge cases: empty strings, single names, extra whitespace.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '';

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, INITIALS_MAX_LENGTH);
}

/**
 * Rounds a number to specified decimal places.
 * Avoids floating point precision issues.
 */
export function roundToDecimal(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Safely calculates average, returning 0 for empty arrays.
 */
export function safeAverage(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return roundToDecimal(sum / values.length);
}
