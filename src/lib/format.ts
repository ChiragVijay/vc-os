/**
 * Shared formatting utilities used across dashboard and founder modules.
 * Consolidates duplicated format functions.
 */

/** Format a metric value by its unit type (used in benchmarks across dashboard & founder). */
export function formatMetricValue(
  value: number,
  unit: string,
  formatCurrency: (v: number, compact?: boolean) => string,
): string {
  switch (unit) {
    case "$":
      return formatCurrency(value, true);
    case "%":
      return `${value.toFixed(1)}%`;
    case "x":
      return `${value.toFixed(1)}x`;
    case "mo":
      return `${value.toFixed(0)} mo`;
    default:
      return value.toLocaleString();
  }
}
