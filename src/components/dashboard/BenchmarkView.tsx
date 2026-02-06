"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCompanies,
  getSnapshots,
  benchmarkCompany,
  benchmarkMetrics,
  cohortStats,
  formatCurrency,
} from "@/src/lib/dashboard";
import type { Company, MonthlySnapshot, BenchmarkResult } from "@/src/lib/dashboard/types";
import { MetricCard } from "./MetricCard";
import { BenchmarkBar } from "./BenchmarkBar";

export const BenchmarkView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState("mrrGrowth");
  const [cohortBy, setCohortBy] = useState<"batch" | "stage">("batch");

  const batch = searchParams.get("batch") ?? "all";
  const sector = searchParams.get("sector") ?? "all";
  const stage = searchParams.get("stage") ?? "all";
  const search = searchParams.get("q") ?? "";

  const allCompanies = getCompanies();

  const filtered = useMemo(() => {
    return allCompanies.filter((c) => {
      if (batch !== "all" && c.batch !== batch) return false;
      if (sector !== "all" && c.sector !== sector) return false;
      if (stage !== "all" && c.stage !== stage) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allCompanies, batch, sector, stage, search]);

  // Build cohort snapshots map
  const cohortSnapshotsMap = useMemo(() => {
    const map = new Map<string, MonthlySnapshot[]>();
    for (const c of filtered) {
      map.set(c.id, getSnapshots(c.id));
    }
    return map;
  }, [filtered]);

  // Benchmark all companies for the selected metric
  const benchmarks = useMemo(() => {
    const results: { company: Company; result: BenchmarkResult | null }[] = [];

    for (const company of filtered) {
      const snaps = cohortSnapshotsMap.get(company.id) ?? [];

      // Build the correct cohort based on selected cohort type
      const cohortMap = new Map<string, MonthlySnapshot[]>();
      for (const c of filtered) {
        if (cohortBy === "batch" && c.batch === company.batch) {
          cohortMap.set(c.id, cohortSnapshotsMap.get(c.id) ?? []);
        } else if (cohortBy === "stage" && c.stage === company.stage) {
          cohortMap.set(c.id, cohortSnapshotsMap.get(c.id) ?? []);
        }
      }

      const benchmarkResults = benchmarkCompany(snaps, cohortMap, [selectedMetric]);
      results.push({
        company,
        result: benchmarkResults[0] ?? null,
      });
    }

    return results
      .filter((r) => r.result !== null)
      .sort((a, b) => (b.result?.percentile ?? 0) - (a.result?.percentile ?? 0));
  }, [filtered, cohortSnapshotsMap, selectedMetric, cohortBy]);

  // Cohort summary stats
  const metricInfo = benchmarkMetrics.find((m) => m.key === selectedMetric);
  const allValues = useMemo(() => {
    if (!metricInfo) return [];
    const vals: number[] = [];
    cohortSnapshotsMap.forEach((snaps) => {
      const v = metricInfo.extract(snaps);
      if (v !== null) vals.push(v);
    });
    return vals;
  }, [cohortSnapshotsMap, metricInfo]);

  const stats = useMemo(() => cohortStats(allValues), [allValues]);

  // Quartile groups
  const quartileGroups = useMemo(() => {
    const groups: Record<number, typeof benchmarks> = { 1: [], 2: [], 3: [], 4: [] };
    for (const b of benchmarks) {
      const q = b.result?.quartile ?? 4;
      groups[q].push(b);
    }
    return groups;
  }, [benchmarks]);

  function formatValue(v: number, unit: string) {
    if (unit === "$") return formatCurrency(v, true);
    if (unit === "%") return `${v.toFixed(1)}%`;
    if (unit === "x") return `${v.toFixed(1)}x`;
    if (unit === "mo") return `${v.toFixed(0)} mo`;
    return v.toLocaleString();
  }

  const selectClass =
    "border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer";

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
          Benchmarks
        </div>
        <h1 className="text-2xl font-serif font-light text-vc-primary">
          Performance Distribution
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className={selectClass}
        >
          {benchmarkMetrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={cohortBy}
          onChange={(e) => setCohortBy(e.target.value as "batch" | "stage")}
          className={selectClass}
        >
          <option value="batch">By Batch</option>
          <option value="stage">By Stage</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-vc-border mb-8">
        <MetricCard
          label="Median"
          value={formatValue(stats.median, metricInfo?.unit ?? "")}
          compact
        />
        <MetricCard
          label="P25"
          value={formatValue(stats.p25, metricInfo?.unit ?? "")}
          compact
        />
        <MetricCard
          label="P75"
          value={formatValue(stats.p75, metricInfo?.unit ?? "")}
          compact
        />
        <MetricCard
          label="Min"
          value={formatValue(stats.min, metricInfo?.unit ?? "")}
          compact
        />
        <MetricCard
          label="Max"
          value={formatValue(stats.max, metricInfo?.unit ?? "")}
          compact
        />
      </div>

      {/* Distribution */}
      <div className="border border-vc-border divide-y divide-vc-border mb-8">
        {benchmarks.map(({ company, result }) => (
          <div
            key={company.id}
            className="px-4 hover:bg-vc-hover transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/${company.id}`)}
          >
            <div className="flex items-center gap-2 pt-3">
              <span
                className="w-2.5 h-2.5 shrink-0"
                style={{ backgroundColor: company.logoColor }}
              />
              <span className="text-sm font-medium text-vc-primary">{company.name}</span>
              <span className="text-xs font-mono text-vc-secondary ml-auto">
                {company.batch} · {company.stage}
              </span>
            </div>
            {result && (
              <BenchmarkBar
                label=""
                value={result.value}
                percentile={result.percentile}
                cohortP25={result.cohortP25}
                cohortP75={result.cohortP75}
                cohortMedian={result.cohortMedian}
                unit={result.unit}
                formatValue={(v) => formatValue(v, result.unit)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Quartile Breakdown */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Quartile Breakdown
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-vc-border">
          {([1, 2, 3, 4] as const).map((q) => (
            <div key={q} className="px-4 py-4 border-r border-vc-border last:border-r-0">
              <div className="flex items-baseline justify-between mb-3">
                <span
                  className={`text-xs font-mono font-medium ${
                    q === 1
                      ? "text-emerald-600"
                      : q === 4
                        ? "text-rose-500"
                        : "text-vc-primary"
                  }`}
                >
                  Q{q}
                </span>
                <span className="text-xs font-mono text-vc-secondary">
                  {quartileGroups[q].length} co.
                </span>
              </div>
              <div className="space-y-1">
                {quartileGroups[q].map(({ company }) => (
                  <button
                    key={company.id}
                    onClick={() => router.push(`/dashboard/${company.id}`)}
                    className="flex items-center gap-1.5 w-full text-left hover:text-accent transition-colors cursor-pointer"
                  >
                    <span
                      className="w-1.5 h-1.5 shrink-0"
                      style={{ backgroundColor: company.logoColor }}
                    />
                    <span className="text-xs text-vc-primary truncate">{company.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
