"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  getCompany,
  getCompanies,
  getSnapshots,
  latestSnapshot,
  previousSnapshot,
  calcMrrGrowth,
  calcArr,
  calcLtvCacRatio,
  calcGrowthTrend,
  deltaFromPrevious,
  formatCurrency,
  formatPercent,
  formatNumber,
  benchmarkCompany,
  generateAlerts,
} from "@/src/lib/dashboard";
import { MetricCard } from "./MetricCard";
import { MetricChart } from "./MetricChart";
import { BenchmarkBar } from "./BenchmarkBar";
import { HealthBadge } from "./HealthBadge";
import { ExportButton, downloadBlob, defaultExportIcons } from "@/src/components/export/ExportButton";
import { exportService, dashboardExportable } from "@/src/lib/export";
import type { Exportable, ExportKind } from "@/src/lib/export/types";
import { ArrowLeft } from "lucide-react";

interface CompanyDetailProps {
  companyId: string;
}

export const CompanyDetail = ({ companyId }: CompanyDetailProps) => {
  const company = getCompany(companyId);
  const snapshots = useMemo(() => getSnapshots(companyId), [companyId]);

  // Register the exportable
  useMemo(() => {
    exportService.registerExportable(dashboardExportable as Exportable<unknown>);
  }, []);
  const latest = useMemo(() => latestSnapshot(snapshots), [snapshots]);
  const prev = useMemo(() => previousSnapshot(snapshots), [snapshots]);

  const growth = latest && prev ? calcMrrGrowth(latest.mrr, prev.mrr) : 0;
  const arr = latest ? calcArr(latest.mrr) : 0;
  const ltvCac = latest ? calcLtvCacRatio(latest.ltv, latest.cac) : 0;
  const growthTrend = calcGrowthTrend(snapshots);

  const mrrDelta = deltaFromPrevious(snapshots, "mrr");
  const churnDelta = deltaFromPrevious(snapshots, "churnRate");

  // Alerts
  const alerts = useMemo(() => generateAlerts(companyId, snapshots), [companyId, snapshots]);
  const worstSeverity = alerts.some((a) => a.severity === "critical")
    ? "critical" as const
    : alerts.some((a) => a.severity === "warning")
      ? "warning" as const
      : "healthy" as const;

  // Benchmarks vs batch cohort
  const benchmarks = useMemo(() => {
    if (!company) return [];
    const allCompanies = getCompanies().filter((c) => c.batch === company.batch);
    const cohortMap = new Map(allCompanies.map((c) => [c.id, getSnapshots(c.id)]));
    return benchmarkCompany(snapshots, cohortMap);
  }, [company, snapshots]);

  // Chart data
  const chartData = useMemo(() => {
    return snapshots
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((s) => ({
        month: s.month.slice(5), // "MM" part
        mrr: s.mrr,
        burn: s.burn,
        customers: s.customers,
        churnRate: s.churnRate,
        runway: s.runway,
        nps: s.nps,
        ltv: s.ltv,
        cac: s.cac,
      }));
  }, [snapshots]);

  if (!company) {
    return (
      <div className="px-6 py-16 max-w-7xl mx-auto text-center">
        <p className="text-xs font-mono text-vc-secondary uppercase tracking-[0.2em]">
          Company not found
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-vc-secondary hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Portfolio
      </Link>

      {/* Company Header */}
      <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-8 pb-6 border-b border-vc-border">
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 shrink-0"
            style={{ backgroundColor: company.logoColor }}
          />
          <h1 className="text-3xl font-serif font-light text-vc-primary">
            {company.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.sector}
          </span>
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.batch}
          </span>
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.stage}
          </span>
          <span className="text-xs font-mono text-vc-secondary">
            {company.teamSize} people
          </span>
          <HealthBadge severity={worstSeverity} />
          <ExportButton
            options={[
              {
                id: "markdown",
                label: "Markdown Report",
                icon: defaultExportIcons.markdown,
                onClick: async () => {
                  const artifact = await exportService.export({
                    kind: "companyReport" as ExportKind,
                    format: "markdown",
                    payload: { company, snapshots },
                  });
                  const data = typeof artifact.data === 'string' ? artifact.data : new Uint8Array(artifact.data);
                  const blob = new Blob([data], { type: artifact.mimeType });
                  downloadBlob(blob, artifact.fileName);
                },
              },
            ]}
          />
        </div>
      </div>

      <p className="text-sm text-vc-tertiary mb-8 max-w-2xl">
        {company.description}
      </p>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border border-vc-border mb-8">
        <MetricCard
          label="MRR"
          value={latest ? formatCurrency(latest.mrr, true) : "—"}
          delta={mrrDelta}
          compact
        />
        <MetricCard
          label="MoM Growth"
          value={formatPercent(growth)}
          compact
        />
        <MetricCard
          label="ARR"
          value={formatCurrency(arr, true)}
          compact
        />
        <MetricCard
          label="Runway"
          value={latest ? `${latest.runway.toFixed(0)} mo` : "—"}
          delta={deltaFromPrevious(snapshots, "runway")}
          invertDelta
          compact
        />
        <MetricCard
          label="Churn"
          value={latest ? `${latest.churnRate.toFixed(1)}%` : "—"}
          delta={churnDelta}
          invertDelta
          compact
        />
        <MetricCard
          label="LTV:CAC"
          value={`${ltvCac.toFixed(1)}x`}
          compact
        />
      </div>

      {/* Growth Trend Badge */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          Growth Trend:
        </span>
        <span
          className={`text-xs font-mono ${
            growthTrend === "accelerating"
              ? "text-emerald-600"
              : growthTrend === "decelerating"
                ? "text-rose-500"
                : "text-vc-secondary"
          }`}
        >
          {growthTrend.charAt(0).toUpperCase() + growthTrend.slice(1)}
        </span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            MRR
          </div>
          <MetricChart
            data={chartData}
            lines={[{ dataKey: "mrr", label: "MRR", color: "#f26522" }]}
            formatY={(v) => `$${(v / 1000).toFixed(0)}K`}
            formatTooltip={(v) => formatCurrency(v)}
            height={220}
          />
        </div>
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            Burn Rate
          </div>
          <MetricChart
            data={chartData}
            lines={[{ dataKey: "burn", label: "Burn", color: "#e11d48" }]}
            formatY={(v) => `$${(v / 1000).toFixed(0)}K`}
            formatTooltip={(v) => formatCurrency(v)}
            height={220}
          />
        </div>
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            Customers
          </div>
          <MetricChart
            data={chartData}
            lines={[{ dataKey: "customers", label: "Customers", color: "#3b82f6" }]}
            formatTooltip={(v) => formatNumber(v)}
            height={220}
          />
        </div>
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            Churn Rate
          </div>
          <MetricChart
            data={chartData}
            lines={[{ dataKey: "churnRate", label: "Churn %", color: "#f59e0b" }]}
            formatY={(v) => `${v.toFixed(0)}%`}
            formatTooltip={(v) => `${v.toFixed(1)}%`}
            height={220}
          />
        </div>
      </div>

      {/* Extra Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            LTV vs CAC
          </div>
          <MetricChart
            data={chartData}
            lines={[
              { dataKey: "ltv", label: "LTV", color: "#10b981" },
              { dataKey: "cac", label: "CAC", color: "#ef4444" },
            ]}
            formatY={(v) => `$${(v / 1000).toFixed(0)}K`}
            formatTooltip={(v) => formatCurrency(v)}
            height={220}
          />
        </div>
        <div className="border border-vc-border p-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
            NPS Score
          </div>
          <MetricChart
            data={chartData}
            lines={[{ dataKey: "nps", label: "NPS", color: "#8b5cf6" }]}
            formatTooltip={(v) => v.toString()}
            height={220}
          />
        </div>
      </div>

      {/* Benchmarks Section */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Benchmark vs {company.batch} Cohort
        </div>
        <div className="border border-vc-border px-4 divide-y divide-vc-border">
          {benchmarks.map((b) => (
            <BenchmarkBar
              key={b.metric}
              label={b.label}
              value={b.value}
              percentile={b.percentile}
              cohortP25={b.cohortP25}
              cohortP75={b.cohortP75}
              cohortMedian={b.cohortMedian}
              unit={b.unit === "$" ? "" : b.unit}
              formatValue={(v) => {
                if (b.unit === "$") return formatCurrency(v, true);
                if (b.unit === "%") return `${v.toFixed(1)}%`;
                if (b.unit === "x") return `${v.toFixed(1)}x`;
                if (b.unit === "mo") return `${v.toFixed(0)} mo`;
                return formatNumber(v);
              }}
            />
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
            Active Alerts
          </div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border border-vc-border px-4 py-3 ${
                  alert.severity === "critical"
                    ? "border-l-4 border-l-rose-500"
                    : alert.severity === "warning"
                      ? "border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-blue-400"
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider ${
                      alert.severity === "critical"
                        ? "text-rose-500"
                        : alert.severity === "warning"
                          ? "text-amber-600"
                          : "text-blue-500"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-vc-tertiary">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Data Table */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Monthly Data
        </div>
        <div className="border border-vc-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black">
                {["Month", "MRR", "Burn", "Runway", "Customers", "Churn", "LTV", "CAC", "NPS"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary px-3 py-2"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {snapshots
                .sort((a, b) => b.month.localeCompare(a.month))
                .map((s) => (
                  <tr
                    key={s.month}
                    className="border-b border-vc-border last:border-0 hover:bg-vc-hover"
                  >
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {s.month}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatCurrency(s.mrr, true)}
                    </td>
                    <td className="text-xs font-mono text-rose-500 px-3 py-2">
                      {formatCurrency(s.burn, true)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {s.runway.toFixed(1)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatNumber(s.customers)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {s.churnRate.toFixed(1)}%
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatCurrency(s.ltv, true)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatCurrency(s.cac, true)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {s.nps}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
