"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCompanies,
  getSnapshots,
  getBatches,
  latestSnapshot,
  calcArr,
  calcMrrGrowth,
  previousSnapshot,
  formatCurrency,
} from "@/src/lib/dashboard";
import type { BatchId } from "@/src/lib/dashboard/types";
import { MetricChart } from "./MetricChart";

const batchColors: Record<BatchId, string> = {
  W25: "#f26522",
  S25: "#3b82f6",
  W26: "#10b981",
  S26: "#8b5cf6",
};

export const CohortAnalysis = () => {
  const searchParams = useSearchParams();
  const sectorFilter = searchParams.get("sector") ?? "all";
  const stageFilter = searchParams.get("stage") ?? "all";

  const allCompanies = getCompanies();
  const batches = getBatches();

  // Filter companies
  const filtered = useMemo(() => {
    return allCompanies.filter((c) => {
      if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      return true;
    });
  }, [allCompanies, sectorFilter, stageFilter]);

  // Batch summaries
  const batchSummaries = useMemo(() => {
    return batches.map((batch) => {
      const batchCompanies = filtered.filter((c) => c.batch === batch);
      const companyData = batchCompanies.map((c) => {
        const snaps = getSnapshots(c.id);
        const latest = latestSnapshot(snaps);
        const prev = previousSnapshot(snaps);
        return { company: c, snaps, latest, prev };
      });

      const totalArr = companyData.reduce(
        (sum, d) => sum + (d.latest ? calcArr(d.latest.mrr) : 0),
        0
      );
      const growths = companyData
        .filter((d) => d.latest && d.prev)
        .map((d) => calcMrrGrowth(d.latest!.mrr, d.prev!.mrr));
      const avgGrowth =
        growths.length > 0 ? growths.reduce((s, g) => s + g, 0) / growths.length : 0;
      const runways = companyData
        .map((d) => d.latest?.runway ?? 0)
        .filter((r) => r > 0)
        .sort((a, b) => a - b);
      const medianRunway = runways.length > 0 ? runways[Math.floor(runways.length / 2)] : 0;

      // Sector distribution
      const sectorCounts: Record<string, number> = {};
      batchCompanies.forEach((c) => {
        sectorCounts[c.sector] = (sectorCounts[c.sector] ?? 0) + 1;
      });

      return {
        batch,
        companyCount: batchCompanies.length,
        totalArr,
        avgGrowth,
        medianRunway,
        sectorCounts,
      };
    });
  }, [batches, filtered]);

  // Cohort MRR curve data — normalize to "month since batch start"
  const cohortCurveData = useMemo(() => {
    const maxMonths = 14;
    const data: Record<string, unknown>[] = [];

    for (let i = 0; i < maxMonths; i++) {
      const row: Record<string, unknown> = { month: `M${i + 1}` };

      for (const batch of batches) {
        const batchCompanies = filtered.filter((c) => c.batch === batch);
        const mrrs: number[] = [];

        for (const c of batchCompanies) {
          const snaps = getSnapshots(c.id).sort((a, b) =>
            a.month.localeCompare(b.month)
          );
          if (snaps[i]) mrrs.push(snaps[i].mrr);
        }

        if (mrrs.length > 0) {
          row[batch] = Math.round(mrrs.reduce((s, v) => s + v, 0) / mrrs.length);
        }
      }

      data.push(row);
    }

    return data;
  }, [batches, filtered]);

  // Cross-batch metrics table
  const crossBatchMetrics = [
    { key: "companyCount", label: "Companies", format: (v: number) => v.toString() },
    { key: "totalArr", label: "Total ARR", format: (v: number) => formatCurrency(v, true) },
    { key: "avgGrowth", label: "Avg Growth", format: (v: number) => `${v.toFixed(1)}%` },
    { key: "medianRunway", label: "Med. Runway", format: (v: number) => `${v.toFixed(0)} mo` },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
          Cohort Analysis
        </div>
        <h1 className="text-2xl font-serif font-light text-vc-primary">
          Batch Performance Comparison
        </h1>
      </div>

      {/* Batch Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {batchSummaries.map((bs) => (
          <div key={bs.batch} className="border border-vc-border px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5"
                style={{ backgroundColor: batchColors[bs.batch] }}
              />
              <span className="text-sm font-mono font-medium text-vc-primary">
                {bs.batch}
              </span>
              <span className="text-xs font-mono text-vc-secondary ml-auto">
                {bs.companyCount} co.
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-vc-secondary">ARR</span>
                <span className="text-vc-primary">{formatCurrency(bs.totalArr, true)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-vc-secondary">Avg Growth</span>
                <span
                  className={
                    bs.avgGrowth > 10
                      ? "text-emerald-600"
                      : bs.avgGrowth > 0
                        ? "text-vc-primary"
                        : "text-rose-500"
                  }
                >
                  {bs.avgGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-vc-secondary">Med. Runway</span>
                <span className="text-vc-primary">{bs.medianRunway.toFixed(0)} mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cohort MRR Curves */}
      <div className="border border-vc-border p-4 mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Avg MRR by Month Since Batch Start
        </div>
        <MetricChart
          data={cohortCurveData}
          lines={batches.map((b) => ({
            dataKey: b,
            label: b,
            color: batchColors[b],
          }))}
          xKey="month"
          height={320}
          formatY={(v) => {
            if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
            return `$${v}`;
          }}
          formatTooltip={(v) => formatCurrency(v, true)}
        />
      </div>

      {/* Cross-Batch Metrics Table */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Cross-Batch Comparison
        </div>
        <div className="border border-vc-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary px-4 py-3">
                  Metric
                </th>
                {batches.map((b) => (
                  <th
                    key={b}
                    className="text-right text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary px-4 py-3"
                  >
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossBatchMetrics.map((metric) => (
                <tr key={metric.key} className="border-b border-vc-border last:border-0">
                  <td className="text-xs font-mono text-vc-primary px-4 py-3">
                    {metric.label}
                  </td>
                  {batchSummaries.map((bs) => {
                    const value = bs[metric.key as keyof typeof bs] as number;
                    return (
                      <td
                        key={bs.batch}
                        className="text-right text-xs font-mono text-vc-primary px-4 py-3"
                      >
                        {metric.format(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Distribution per Batch */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Sector Distribution by Batch
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {batchSummaries.map((bs) => (
            <div key={bs.batch} className="border border-vc-border px-4 py-4">
              <div className="text-xs font-mono font-medium text-vc-primary mb-3">
                {bs.batch}
              </div>
              <div className="space-y-1.5">
                {Object.entries(bs.sectorCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sector, count]) => (
                    <div key={sector} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div
                          className="h-1.5 bg-accent/30"
                          style={{
                            width: `${(count / bs.companyCount) * 100}%`,
                          }}
                        >
                          <div
                            className="h-full bg-accent"
                            style={{
                              width: `${(count / bs.companyCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-vc-secondary w-16 text-right">
                        {sector}
                      </span>
                      <span className="text-[11px] font-mono text-vc-primary w-4 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
