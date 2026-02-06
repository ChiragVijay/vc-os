import type { MonthlySnapshot, GrowthTrend } from "./types";

export function latestSnapshot(snapshots: MonthlySnapshot[]): MonthlySnapshot | null {
  if (!snapshots.length) return null;
  return snapshots.reduce((a, b) => (a.month > b.month ? a : b));
}

export function previousSnapshot(snapshots: MonthlySnapshot[]): MonthlySnapshot | null {
  if (snapshots.length < 2) return null;
  const sorted = [...snapshots].sort((a, b) => b.month.localeCompare(a.month));
  return sorted[1];
}

export function calcMrrGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calcArr(mrr: number): number {
  return mrr * 12;
}

export function calcLtvCacRatio(ltv: number, cac: number): number {
  if (cac === 0) return 0;
  return ltv / cac;
}

export function calcBurnMultiple(burn: number, netNewArr: number): number {
  if (netNewArr <= 0) return Infinity;
  return burn / netNewArr;
}

export function calcGrowthTrend(snapshots: MonthlySnapshot[], months: number = 3): GrowthTrend {
  if (snapshots.length < months + 1) return "stable";

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const recent = sorted.slice(-months - 1);

  const growthRates: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    growthRates.push(calcMrrGrowth(recent[i].mrr, recent[i - 1].mrr));
  }

  const first = growthRates[0];
  const last = growthRates[growthRates.length - 1];

  if (last > first + 2) return "accelerating";
  if (last < first - 2) return "decelerating";
  return "stable";
}

export function deltaFromPrevious(
  snapshots: MonthlySnapshot[],
  metric: keyof MonthlySnapshot
): number | null {
  const latest = latestSnapshot(snapshots);
  const prev = previousSnapshot(snapshots);
  if (!latest || !prev) return null;

  const currentVal = latest[metric] as number;
  const prevVal = prev[metric] as number;

  if (typeof currentVal !== "number" || typeof prevVal !== "number") return null;
  if (prevVal === 0) return 0;

  return ((currentVal - prevVal) / prevVal) * 100;
}

export function momGrowthSeries(snapshots: MonthlySnapshot[]): { month: string; growth: number }[] {
  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const result: { month: string; growth: number }[] = [];

  for (let i = 1; i < sorted.length; i++) {
    result.push({
      month: sorted[i].month,
      growth: calcMrrGrowth(sorted[i].mrr, sorted[i - 1].mrr),
    });
  }

  return result;
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
