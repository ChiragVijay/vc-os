import type { FounderMonthlyMetrics, ScenarioProjection } from "./types";
import { getCompanies, getSnapshots } from "../dashboard";

/**
 * Calculate month-over-month growth rates from snapshots.
 */
export function momGrowthRates(
  snapshots: FounderMonthlyMetrics[]
): { month: string; growth: number }[] {
  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const rates: { month: string; growth: number }[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].mrr;
    const curr = sorted[i].mrr;
    rates.push({
      month: sorted[i].month,
      growth: prev > 0 ? ((curr - prev) / prev) * 100 : 0,
    });
  }

  return rates;
}

/**
 * Calculate average MoM growth rate over last N months.
 */
export function avgRecentGrowth(
  snapshots: FounderMonthlyMetrics[],
  months: number = 3
): number {
  const rates = momGrowthRates(snapshots);
  if (rates.length === 0) return 0;
  const recent = rates.slice(-months);
  return recent.reduce((sum, r) => sum + r.growth, 0) / recent.length;
}

/**
 * Project MRR forward by N months using a given monthly growth rate.
 */
export function projectMrr(
  currentMrr: number,
  monthlyGrowthPct: number,
  months: number
): number {
  const rate = monthlyGrowthPct / 100;
  return Math.round(currentMrr * Math.pow(1 + rate, months));
}

/**
 * Generate projected data points for charting.
 * Returns historical + projected months.
 */
export function generateProjection(
  snapshots: FounderMonthlyMetrics[],
  monthsAhead: number = 6
): { month: string; mrr: number; projected: boolean }[] {
  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const historical = sorted.map((s) => ({
    month: s.month,
    mrr: s.mrr,
    projected: false,
  }));

  if (sorted.length === 0) return historical;

  const lastSnap = sorted[sorted.length - 1];
  const avgGrowth = avgRecentGrowth(snapshots, 3);
  const rate = avgGrowth / 100;

  const [lastYear, lastMonth] = lastSnap.month.split("-").map(Number);
  let mrr = lastSnap.mrr;

  for (let i = 1; i <= monthsAhead; i++) {
    const totalMonths = lastMonth - 1 + i;
    const year = lastYear + Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;
    mrr = Math.round(mrr * (1 + rate));

    historical.push({
      month: `${year}-${month.toString().padStart(2, "0")}`,
      mrr,
      projected: true,
    });
  }

  return historical;
}

/**
 * Calculate runway countdown at current burn rate.
 */
export function calcRunwayMonths(
  currentMrr: number,
  currentBurn: number
): number {
  if (currentBurn <= currentMrr) return 36; // Cash-flow positive
  const netBurn = currentBurn - currentMrr * 0.3;
  if (netBurn <= 0) return 36;
  return Math.round(((currentMrr * 6) / netBurn) * 10) / 10;
}

/**
 * Generate three scenario projections (conservative, current, optimistic).
 */
export function generateScenarios(
  snapshots: FounderMonthlyMetrics[]
): ScenarioProjection[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const currentMrr = sorted[sorted.length - 1].mrr;
  const avgGrowth = avgRecentGrowth(snapshots, 3);

  const scenarios: ScenarioProjection[] = [
    {
      label: "Conservative",
      growthRate: Math.max(0, avgGrowth * 0.5),
      projectedMrr6mo: projectMrr(currentMrr, avgGrowth * 0.5, 6),
      projectedMrr12mo: projectMrr(currentMrr, avgGrowth * 0.5, 12),
      projectedArr12mo: projectMrr(currentMrr, avgGrowth * 0.5, 12) * 12,
    },
    {
      label: "Current Pace",
      growthRate: avgGrowth,
      projectedMrr6mo: projectMrr(currentMrr, avgGrowth, 6),
      projectedMrr12mo: projectMrr(currentMrr, avgGrowth, 12),
      projectedArr12mo: projectMrr(currentMrr, avgGrowth, 12) * 12,
    },
    {
      label: "Optimistic",
      growthRate: avgGrowth * 1.5,
      projectedMrr6mo: projectMrr(currentMrr, avgGrowth * 1.5, 6),
      projectedMrr12mo: projectMrr(currentMrr, avgGrowth * 1.5, 12),
      projectedArr12mo: projectMrr(currentMrr, avgGrowth * 1.5, 12) * 12,
    },
  ];

  return scenarios;
}

/**
 * Determine growth trend direction.
 */
export function growthTrend(
  snapshots: FounderMonthlyMetrics[],
  months: number = 3
): "accelerating" | "stable" | "decelerating" {
  const rates = momGrowthRates(snapshots);
  if (rates.length < months) return "stable";

  const recent = rates.slice(-months);
  const first = recent[0].growth;
  const last = recent[recent.length - 1].growth;

  if (last > first + 2) return "accelerating";
  if (last < first - 2) return "decelerating";
  return "stable";
}

/**
 * Get anonymized batch MRR curves for overlay chart.
 * Returns an array of curves (one per company) with no identifying information.
 */
export function getAnonymizedBatchCurves(
  batch: string
): { curveId: number; data: { monthIndex: number; mrr: number }[] }[] {
  const companies = getCompanies().filter((c) => c.batch === batch);

  return companies.map((c, idx) => {
    const snaps = getSnapshots(c.id);
    const sorted = [...snaps].sort((a, b) => a.month.localeCompare(b.month));
    return {
      curveId: idx,
      data: sorted.map((s, i) => ({ monthIndex: i, mrr: s.mrr })),
    };
  });
}
