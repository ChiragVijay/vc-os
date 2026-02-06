"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCompanies,
  getSnapshots,
  latestSnapshot,
  previousSnapshot,
  calcMrrGrowth,
  calcArr,
  formatCurrency,
  formatPercent,
  generateAlerts,
} from "@/src/lib/dashboard";
import type { MonthlySnapshot, AlertSeverity } from "@/src/lib/dashboard/types";
import { MetricCard } from "./MetricCard";
import { SparklineChart } from "./SparklineChart";
import { HealthBadge } from "./HealthBadge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "name" | "sector" | "batch" | "mrr" | "growth" | "runway" | "health";
type SortDir = "asc" | "desc";

function getHealthSeverity(companyId: string, snapshots: MonthlySnapshot[]): AlertSeverity | "healthy" {
  const alerts = generateAlerts(companyId, snapshots);
  if (alerts.some((a) => a.severity === "critical")) return "critical";
  if (alerts.some((a) => a.severity === "warning")) return "warning";
  return "healthy";
}

export const PortfolioOverview = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("mrr");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  // Pre-compute snapshots for each company
  const companyData = useMemo(() => {
    return filtered.map((company) => {
      const snaps = getSnapshots(company.id);
      const latest = latestSnapshot(snaps);
      const prev = previousSnapshot(snaps);
      const growth = latest && prev ? calcMrrGrowth(latest.mrr, prev.mrr) : 0;
      const health = getHealthSeverity(company.id, snaps);
      const sparkline = snaps
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6)
        .map((s) => ({ value: s.mrr }));

      return { company, snaps, latest, growth, health, sparkline };
    });
  }, [filtered]);

  // Sort
  const sorted = useMemo(() => {
    return [...companyData].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.company.name.localeCompare(b.company.name); break;
        case "sector": cmp = a.company.sector.localeCompare(b.company.sector); break;
        case "batch": cmp = a.company.batch.localeCompare(b.company.batch); break;
        case "mrr": cmp = (a.latest?.mrr ?? 0) - (b.latest?.mrr ?? 0); break;
        case "growth": cmp = a.growth - b.growth; break;
        case "runway": cmp = (a.latest?.runway ?? 0) - (b.latest?.runway ?? 0); break;
        case "health": {
          const order = { critical: 0, warning: 1, healthy: 2, info: 1 };
          cmp = (order[a.health] ?? 2) - (order[b.health] ?? 2);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [companyData, sortKey, sortDir]);

  // Aggregate metrics
  const aggregates = useMemo(() => {
    const totalArr = companyData.reduce(
      (sum, d) => sum + (d.latest ? calcArr(d.latest.mrr) : 0),
      0
    );
    const growths = companyData.map((d) => d.growth).filter((g) => g !== 0);
    const avgGrowth = growths.length > 0
      ? growths.reduce((s, g) => s + g, 0) / growths.length
      : 0;
    const runways = companyData
      .map((d) => d.latest?.runway ?? 0)
      .filter((r) => r > 0)
      .sort((a, b) => a - b);
    const medianRunway = runways.length > 0
      ? runways[Math.floor(runways.length / 2)]
      : 0;
    const flagged = companyData.filter(
      (d) => d.health === "critical" || d.health === "warning"
    ).length;

    return { totalArr, avgGrowth, medianRunway, flagged };
  }, [companyData]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-vc-secondary" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-accent" />
      : <ArrowDown className="w-3 h-3 text-accent" />;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
          Portfolio Overview
        </div>
        <h1 className="text-2xl font-serif font-light text-vc-primary">
          {filtered.length} {filtered.length === 1 ? "Company" : "Companies"}
          {batch !== "all" && <span className="text-vc-secondary"> · {batch}</span>}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-vc-border mb-8">
        <MetricCard
          label="Portfolio ARR"
          value={formatCurrency(aggregates.totalArr, true)}
        />
        <MetricCard
          label="Avg MoM Growth"
          value={formatPercent(aggregates.avgGrowth)}
        />
        <MetricCard
          label="Median Runway"
          value={`${aggregates.medianRunway.toFixed(1)} mo`}
        />
        <MetricCard
          label="Flagged"
          value={aggregates.flagged.toString()}
          delta={null}
        />
      </div>

      {/* Company Table */}
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 pb-2 border-b border-black min-w-[700px]">
          {([
            { key: "name" as const, label: "Company", span: 3 },
            { key: "sector" as const, label: "Sector", span: 1 },
            { key: "batch" as const, label: "Batch", span: 1 },
            { key: "mrr" as const, label: "MRR", span: 2 },
            { key: "growth" as const, label: "MoM", span: 2 },
            { key: "runway" as const, label: "Runway", span: 1 },
            { key: "health" as const, label: "Health", span: 2 },
          ] as const).map((col) => (
            <button
              key={col.key}
              onClick={() => toggleSort(col.key)}
              className={`col-span-${col.span} flex items-center gap-1 text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary hover:text-vc-primary transition-colors cursor-pointer`}
            >
              {col.label}
              <SortIcon col={col.key} />
            </button>
          ))}
        </div>

        {/* Rows */}
        {sorted.map(({ company, latest, growth, health, sparkline }) => (
          <button
            key={company.id}
            onClick={() => router.push(`/dashboard/${company.id}`)}
            className="grid grid-cols-12 gap-4 py-4 border-b border-vc-border w-full text-left hover:bg-vc-hover transition-colors cursor-pointer min-w-[700px]"
          >
            <div className="col-span-3 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 flex-shrink-0"
                style={{ backgroundColor: company.logoColor }}
              />
              <span className="text-sm font-medium text-vc-primary truncate">
                {company.name}
              </span>
            </div>
            <div className="col-span-1 text-xs font-mono text-vc-secondary">
              {company.sector}
            </div>
            <div className="col-span-1 text-xs font-mono text-vc-secondary">
              {company.batch}
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-sm text-vc-primary">
                {latest ? formatCurrency(latest.mrr, true) : "—"}
              </span>
              <SparklineChart data={sparkline} />
            </div>
            <div className="col-span-2 flex items-center">
              <span
                className={`text-sm font-mono ${
                  growth > 10
                    ? "text-emerald-600"
                    : growth > 0
                      ? "text-vc-primary"
                      : growth < 0
                        ? "text-rose-500"
                        : "text-vc-secondary"
                }`}
              >
                {formatPercent(growth)}
              </span>
            </div>
            <div className="col-span-1 text-sm text-vc-primary">
              {latest ? `${latest.runway.toFixed(0)} mo` : "—"}
            </div>
            <div className="col-span-2">
              <HealthBadge severity={health} />
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <div className="py-12 text-center text-xs text-vc-secondary font-mono">
            No companies match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
