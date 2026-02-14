/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a year number to a string. Returns empty string if undefined.
 */
export function formatYear(year: number | undefined): string {
  if (year === undefined) return ''
  return String(year)
}
