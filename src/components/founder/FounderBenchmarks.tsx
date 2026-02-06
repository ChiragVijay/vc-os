"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  loadFounderProfile,
  benchmarkFounder,
  getDistribution,
  type CohortFilter,
} from "@/src/lib/founder";
import type { FounderProfile } from "@/src/lib/founder";
import { BenchmarkBar } from "@/src/components/dashboard/BenchmarkBar";
import { formatCurrency } from "@/src/lib/dashboard";
import { useRouter } from "next/navigation";

const COHORT_OPTIONS: { label: string; filter: CohortFilter; getValue?: (p: FounderProfile) => string }[] = [
  { label: "All Companies", filter: "all" },
  { label: "My Batch", filter: "batch", getValue: (p) => p.company.batch },
  { label: "My Sector", filter: "sector", getValue: (p) => p.company.sector },
  { label: "My Stage", filter: "stage", getValue: (p) => p.company.stage },
];

function formatBenchmarkValue(value: number, unit: string): string {
  if (unit === "$") return formatCurrency(value, true);
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "x") return `${value.toFixed(1)}x`;
  if (unit === "mo") return `${value.toFixed(0)}mo`;
  return value.toLocaleString();
}

export const FounderBenchmarks = () => {
  const router = useRouter();
  const [profile] = useState<FounderProfile | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFounderProfile();
  });
  const [cohortIdx, setCohortIdx] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState("mrrGrowth");

  const benchmarks = useMemo(() => {
    if (!profile) return [];
    const opt = COHORT_OPTIONS[cohortIdx];
    const filterValue = opt.getValue?.(profile);
    return benchmarkFounder(profile.snapshots, opt.filter, filterValue);
  }, [profile, cohortIdx]);

  const distribution = useMemo(() => {
    if (!profile) return [];
    const opt = COHORT_OPTIONS[cohortIdx];
    const filterValue = opt.getValue?.(profile);
    return getDistribution(profile.snapshots, selectedMetric, opt.filter, filterValue);
  }, [profile, cohortIdx, selectedMetric]);

  if (!profile) {
    if (typeof window !== "undefined") router.push("/founder");
    return null;
  }

  // Summary stats
  const avgPercentile =
    benchmarks.length > 0
      ? Math.round(
          benchmarks.reduce((s, b) => s + b.percentile, 0) / benchmarks.length
        )
      : 0;
  const topQuartileCount = benchmarks.filter((b) => b.quartile === 1).length;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
            Anonymized Benchmarking
          </div>
          <h1 className="text-2xl font-serif font-light mb-1">
            {profile.company.name} vs. YC Cohort
          </h1>
          <p className="text-xs text-vc-tertiary">
            Your percentile rank against {30} companies. No individual data exposed.
          </p>
        </div>
      </div>

      {/* Cohort Selector */}
      <div className="flex gap-0 mb-8 border-b border-vc-border">
        {COHORT_OPTIONS.map((opt, idx) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setCohortIdx(idx)}
            className={`px-4 py-3 text-xs font-mono tracking-[0.15em] uppercase transition-colors border-b-2 -mb-px ${
              cohortIdx === idx
                ? "border-accent text-vc-primary"
                : "border-transparent text-vc-secondary hover:text-vc-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1">
            Avg Percentile
          </div>
          <div className="text-2xl font-light">P{avgPercentile}</div>
        </div>
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1">
            Top Quartile Metrics
          </div>
          <div className="text-2xl font-light">
            {topQuartileCount}
            <span className="text-sm text-vc-secondary">
              {" "}/ {benchmarks.length}
            </span>
          </div>
        </div>
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1">
            Comparing Against
          </div>
          <div className="text-2xl font-light">
            {COHORT_OPTIONS[cohortIdx].label}
          </div>
        </div>
      </div>

      {/* Benchmark Bars */}
      <div className="border border-vc-border mb-8">
        <div className="px-4 py-3 border-b border-vc-border bg-vc-hover">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            Percentile Rankings
          </span>
        </div>
        <div className="px-4 divide-y divide-vc-border">
          {benchmarks.map((b) => (
            <div
              key={b.metric}
              className={`cursor-pointer transition-colors ${
                selectedMetric === b.metric ? "bg-accent/5" : ""
              }`}
              onClick={() => setSelectedMetric(b.metric)}
            >
              <BenchmarkBar
                label={b.label}
                value={b.value}
                percentile={b.percentile}
                cohortP25={b.cohortP25}
                cohortP75={b.cohortP75}
                cohortMedian={b.cohortMedian}
                unit={b.unit}
                formatValue={(v) => formatBenchmarkValue(v, b.unit)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Chart */}
      {distribution.length > 0 && (
        <div className="border border-vc-border">
          <div className="px-4 py-3 border-b border-vc-border bg-vc-hover">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
              Distribution —{" "}
              {benchmarks.find((b) => b.metric === selectedMetric)?.label ?? selectedMetric}
            </span>
          </div>
          <div className="px-4 py-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <XAxis
                    dataKey="binLabel"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      padding: "6px 10px",
                    }}
                    formatter={(value: number | undefined) => [
                      `${value ?? 0} companies`,
                      "",
                    ]}
                  />
                  <Bar dataKey="count" radius={0}>
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isFounder ? "#f26522" : "#e5e5e5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 text-[11px] font-mono text-vc-secondary">
              Your position highlighted in orange
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
