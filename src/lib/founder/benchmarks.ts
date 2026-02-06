import type { MonthlySnapshot } from "../dashboard/types";
import type { FounderMonthlyMetrics, FounderBenchmarkResult } from "./types";
import {
  benchmarkMetrics,
  percentile,
  quartile,
  cohortStats,
  getCompanies,
  getSnapshots,
} from "../dashboard";

/**
 * Convert founder metrics to dashboard MonthlySnapshot shape
 * so we can reuse the existing benchmark extraction functions.
 */
function toSnapshot(m: FounderMonthlyMetrics): MonthlySnapshot {
  return {
    companyId: "__founder__",
    month: m.month,
    mrr: m.mrr,
    burn: m.burn,
    runway: m.runway,
    customers: m.customers,
    churnRate: m.churnRate,
    ltv: m.ltv,
    cac: m.cac,
    nps: m.nps,
  };
}

export type CohortFilter = "all" | "batch" | "sector" | "stage";

/**
 * Build the cohort comparison map filtered by a given dimension.
 * Returns a Map<companyId, MonthlySnapshot[]> of the cohort companies.
 */
export function buildCohortMap(
  filter: CohortFilter,
  filterValue?: string
): Map<string, MonthlySnapshot[]> {
  const companies = getCompanies();
  const cohort = new Map<string, MonthlySnapshot[]>();

  for (const c of companies) {
    let include = false;
    switch (filter) {
      case "all":
        include = true;
        break;
      case "batch":
        include = c.batch === filterValue;
        break;
      case "sector":
        include = c.sector === filterValue;
        break;
      case "stage":
        include = c.stage === filterValue;
        break;
    }
    if (include) {
      cohort.set(c.id, getSnapshots(c.id));
    }
  }

  return cohort;
}

/**
 * Benchmark founder metrics against the portfolio cohort.
 * Only anonymized aggregate stats are returned — no individual company data.
 */
export function benchmarkFounder(
  founderSnapshots: FounderMonthlyMetrics[],
  cohortFilter: CohortFilter = "all",
  cohortFilterValue?: string,
  metricKeys?: string[]
): FounderBenchmarkResult[] {
  const founderAsSnapshots = founderSnapshots.map(toSnapshot);
  const cohortMap = buildCohortMap(cohortFilter, cohortFilterValue);

  const metricsToUse = metricKeys
    ? benchmarkMetrics.filter((m) => metricKeys.includes(m.key))
    : benchmarkMetrics;

  const results: FounderBenchmarkResult[] = [];

  for (const metric of metricsToUse) {
    const founderValue = metric.extract(founderAsSnapshots);
    if (founderValue === null) continue;

    const cohortValues: number[] = [];
    cohortMap.forEach((snaps) => {
      const val = metric.extract(snaps);
      if (val !== null) cohortValues.push(val);
    });

    if (cohortValues.length === 0) continue;

    const pct = metric.higherIsBetter
      ? percentile(founderValue, cohortValues)
      : 100 - percentile(founderValue, cohortValues);
    const stats = cohortStats(cohortValues);

    results.push({
      metric: metric.key,
      label: metric.label,
      value: founderValue,
      percentile: pct,
      quartile: quartile(pct),
      cohortMedian: stats.median,
      cohortP25: stats.p25,
      cohortP75: stats.p75,
      unit: metric.unit,
      higherIsBetter: metric.higherIsBetter,
    });
  }

  return results;
}

/**
 * Get the anonymized distribution for a single metric across the cohort.
 * Returns an array of bin objects (10th percentile buckets).
 * The founder's value is tagged for highlighting.
 */
export function getDistribution(
  founderSnapshots: FounderMonthlyMetrics[],
  metricKey: string,
  cohortFilter: CohortFilter = "all",
  cohortFilterValue?: string
): { binLabel: string; count: number; isFounder: boolean }[] {
  const founderAsSnapshots = founderSnapshots.map(toSnapshot);
  const cohortMap = buildCohortMap(cohortFilter, cohortFilterValue);

  const metric = benchmarkMetrics.find((m) => m.key === metricKey);
  if (!metric) return [];

  const founderValue = metric.extract(founderAsSnapshots);
  const allValues: number[] = [];
  cohortMap.forEach((snaps) => {
    const val = metric.extract(snaps);
    if (val !== null) allValues.push(val);
  });

  if (allValues.length === 0) return [];

  // Sort and compute percentiles for each value
  const sorted = [...allValues].sort((a, b) => a - b);
  const bins = Array.from({ length: 10 }, (_, i) => ({
    binLabel: `P${i * 10}–${(i + 1) * 10}`,
    count: 0,
    isFounder: false,
  }));

  for (const val of sorted) {
    const pct = metric.higherIsBetter
      ? percentile(val, sorted)
      : 100 - percentile(val, sorted);
    const binIdx = Math.min(9, Math.floor(pct / 10));
    bins[binIdx].count++;
  }

  // Mark the founder's bin
  if (founderValue !== null) {
    const founderPct = metric.higherIsBetter
      ? percentile(founderValue, sorted)
      : 100 - percentile(founderValue, sorted);
    const founderBin = Math.min(9, Math.floor(founderPct / 10));
    bins[founderBin].isFounder = true;
  }

  return bins;
}
