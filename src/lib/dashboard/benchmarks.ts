import type { MonthlySnapshot, BenchmarkResult } from "./types";
import { latestSnapshot, calcMrrGrowth, previousSnapshot } from "./metrics";

type MetricExtractor = {
  key: string;
  label: string;
  unit: string;
  extract: (snapshots: MonthlySnapshot[]) => number | null;
  higherIsBetter: boolean;
};

export const benchmarkMetrics: MetricExtractor[] = [
  {
    key: "mrrGrowth",
    label: "MoM Growth",
    unit: "%",
    extract: (snaps) => {
      const l = latestSnapshot(snaps);
      const p = previousSnapshot(snaps);
      if (!l || !p) return null;
      return calcMrrGrowth(l.mrr, p.mrr);
    },
    higherIsBetter: true,
  },
  {
    key: "mrr",
    label: "MRR",
    unit: "$",
    extract: (snaps) => latestSnapshot(snaps)?.mrr ?? null,
    higherIsBetter: true,
  },
  {
    key: "runway",
    label: "Runway",
    unit: "mo",
    extract: (snaps) => latestSnapshot(snaps)?.runway ?? null,
    higherIsBetter: true,
  },
  {
    key: "churnRate",
    label: "Churn Rate",
    unit: "%",
    extract: (snaps) => latestSnapshot(snaps)?.churnRate ?? null,
    higherIsBetter: false,
  },
  {
    key: "ltvCac",
    label: "LTV:CAC",
    unit: "x",
    extract: (snaps) => {
      const l = latestSnapshot(snaps);
      if (!l || l.cac === 0) return null;
      return l.ltv / l.cac;
    },
    higherIsBetter: true,
  },
  {
    key: "customers",
    label: "Customers",
    unit: "",
    extract: (snaps) => latestSnapshot(snaps)?.customers ?? null,
    higherIsBetter: true,
  },
  {
    key: "nps",
    label: "NPS",
    unit: "",
    extract: (snaps) => latestSnapshot(snaps)?.nps ?? null,
    higherIsBetter: true,
  },
  {
    key: "burn",
    label: "Burn Rate",
    unit: "$",
    extract: (snaps) => latestSnapshot(snaps)?.burn ?? null,
    higherIsBetter: false,
  },
];

export function percentile(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => v >= value);
  if (idx === -1) return 100;
  return Math.round((idx / sorted.length) * 100);
}

export function quartile(p: number): 1 | 2 | 3 | 4 {
  if (p >= 75) return 1;
  if (p >= 50) return 2;
  if (p >= 25) return 3;
  return 4;
}

export function cohortStats(values: number[]): {
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  if (len === 0) return { median: 0, p25: 0, p75: 0, min: 0, max: 0 };

  return {
    median: sorted[Math.floor(len / 2)],
    p25: sorted[Math.floor(len * 0.25)],
    p75: sorted[Math.floor(len * 0.75)],
    min: sorted[0],
    max: sorted[len - 1],
  };
}

export function benchmarkCompany(
  companySnapshots: MonthlySnapshot[],
  cohortSnapshotsMap: Map<string, MonthlySnapshot[]>,
  metricKeys?: string[]
): BenchmarkResult[] {
  const metricsToUse = metricKeys
    ? benchmarkMetrics.filter((m) => metricKeys.includes(m.key))
    : benchmarkMetrics;

  const results: BenchmarkResult[] = [];

  for (const metric of metricsToUse) {
    const companyValue = metric.extract(companySnapshots);
    if (companyValue === null) continue;

    const cohortValues: number[] = [];
    cohortSnapshotsMap.forEach((snaps) => {
      const val = metric.extract(snaps);
      if (val !== null) cohortValues.push(val);
    });

    if (cohortValues.length === 0) continue;

    const pct = metric.higherIsBetter
      ? percentile(companyValue, cohortValues)
      : 100 - percentile(companyValue, cohortValues);
    const stats = cohortStats(cohortValues);

    results.push({
      metric: metric.key,
      label: metric.label,
      value: companyValue,
      percentile: pct,
      quartile: quartile(pct),
      cohortMedian: stats.median,
      cohortP25: stats.p25,
      cohortP75: stats.p75,
      unit: metric.unit,
    });
  }

  return results;
}
