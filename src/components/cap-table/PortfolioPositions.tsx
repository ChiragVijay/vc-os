"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getPortfolioPositions,
  computePortfolioSummary,
  formatCurrencyShort,
  formatCurrencyFull,
} from "@/src/lib/cap-table";
import { MetricCard } from "@/src/components/dashboard/MetricCard";
import { ArrowUpDown, ChevronRight } from "lucide-react";

type SortKey = "companyName" | "checkSize" | "ownershipPct" | "impliedValuation" | "moic" | "unrealizedValue";
type SortDir = "asc" | "desc";

export const PortfolioPositions = () => {
  const positions = useMemo(() => getPortfolioPositions(), []);
  const summary = useMemo(() => computePortfolioSummary(positions), [positions]);

  const [sortKey, setSortKey] = useState<SortKey>("moic");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...positions]
      .filter((p) => p.checkSize > 0)
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
  }, [positions, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortHeader = ({
    label,
    field,
    className = "",
  }: {
    label: string;
    field: SortKey;
    className?: string;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-left text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary hover:text-accent transition-colors ${className}`}
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sortKey === field ? "text-accent" : "text-vc-border"}`}
      />
    </button>
  );

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-vc-primary mb-2">
          Cap Table
        </h1>
        <p className="text-xs text-vc-tertiary max-w-lg">
          Portfolio investment positions, ownership tracking, and fund-level metrics
          across all active investments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border border-vc-border mb-6 sm:mb-8">
        <MetricCard
          label="Total Deployed"
          value={formatCurrencyShort(summary.totalDeployed)}
          compact
        />
        <MetricCard
          label="Portfolio Value"
          value={formatCurrencyShort(summary.totalFairValue)}
          compact
        />
        <MetricCard
          label="Blended MOIC"
          value={`${summary.blendedMoic.toFixed(1)}x`}
          compact
        />
        <MetricCard
          label="Avg Ownership"
          value={`${summary.avgOwnership.toFixed(1)}%`}
          compact
        />
        <MetricCard
          label="Active Positions"
          value={summary.activePositions.toString()}
          compact
        />
      </div>

      {/* Mobile Sort Control */}
      <div className="flex items-center gap-2 mb-3 md:hidden">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary">Sort:</span>
        <select
          value={sortKey}
          onChange={(e) => {
            setSortKey(e.target.value as SortKey);
            setSortDir("desc");
          }}
          className="text-[11px] font-mono border border-vc-border bg-white px-2 py-1 text-vc-primary"
        >
          <option value="moic">MOIC</option>
          <option value="companyName">Company</option>
          <option value="checkSize">Check Size</option>
          <option value="ownershipPct">Ownership</option>
          <option value="impliedValuation">Valuation</option>
          <option value="unrealizedValue">Unrealized</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="text-[11px] font-mono border border-vc-border bg-white px-2 py-1 text-vc-secondary"
        >
          {sortDir === "desc" ? "High-Low" : "Low-High"}
        </button>
      </div>

      {/* ─── Desktop Table (hidden on mobile) ─── */}
      <div className="hidden md:block border border-vc-border">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-black">
          <SortHeader label="Company" field="companyName" className="col-span-3" />
          <div className="col-span-1 text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary">
            Stage
          </div>
          <SortHeader label="Check Size" field="checkSize" className="col-span-2" />
          <SortHeader label="Own %" field="ownershipPct" className="col-span-1" />
          <SortHeader label="Implied Val" field="impliedValuation" className="col-span-2" />
          <SortHeader label="MOIC" field="moic" className="col-span-1" />
          <SortHeader label="Unrealized" field="unrealizedValue" className="col-span-2" />
        </div>

        {sorted.map((pos) => (
          <Link
            key={pos.companyId}
            href={`/cap-table/${pos.companyId}`}
            className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-vc-border last:border-0 hover:bg-vc-hover transition-colors cursor-pointer"
          >
            <div className="col-span-3 flex items-center gap-2">
              <span
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: pos.logoColor }}
              />
              <span className="text-xs font-mono text-vc-primary truncate">
                {pos.companyName}
              </span>
            </div>
            <div className="col-span-1 text-xs font-mono text-vc-secondary">
              {pos.stage}
            </div>
            <div className="col-span-2 text-xs font-mono text-vc-primary">
              {formatCurrencyFull(pos.checkSize)}
            </div>
            <div className="col-span-1 text-xs font-mono text-vc-primary">
              {pos.ownershipPct.toFixed(1)}%
            </div>
            <div className="col-span-2 text-xs font-mono text-vc-primary">
              {formatCurrencyShort(pos.impliedValuation)}
            </div>
            <div
              className={`col-span-1 text-xs font-mono font-medium ${
                pos.moic >= 3
                  ? "text-emerald-600"
                  : pos.moic >= 1
                    ? "text-vc-primary"
                    : "text-rose-500"
              }`}
            >
              {pos.moic.toFixed(1)}x
            </div>
            <div className="col-span-2 text-xs font-mono text-vc-primary">
              {formatCurrencyShort(pos.unrealizedValue)}
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Mobile Card List (hidden on desktop) ─── */}
      <div className="md:hidden space-y-2">
        {sorted.map((pos) => (
          <Link
            key={pos.companyId}
            href={`/cap-table/${pos.companyId}`}
            className="block border border-vc-border p-4 hover:bg-vc-hover transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 shrink-0"
                  style={{ backgroundColor: pos.logoColor }}
                />
                <span className="text-sm font-mono text-vc-primary font-medium truncate">
                  {pos.companyName}
                </span>
                <span className="text-[10px] font-mono text-vc-secondary shrink-0">
                  {pos.stage}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-vc-border shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary mb-0.5">
                  Check
                </div>
                <div className="text-xs font-mono text-vc-primary">
                  {formatCurrencyShort(pos.checkSize)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary mb-0.5">
                  Own %
                </div>
                <div className="text-xs font-mono text-vc-primary">
                  {pos.ownershipPct.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary mb-0.5">
                  MOIC
                </div>
                <div
                  className={`text-xs font-mono font-medium ${
                    pos.moic >= 3
                      ? "text-emerald-600"
                      : pos.moic >= 1
                        ? "text-vc-primary"
                        : "text-rose-500"
                  }`}
                >
                  {pos.moic.toFixed(1)}x
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary mb-0.5">
                  Valuation
                </div>
                <div className="text-xs font-mono text-vc-primary">
                  {formatCurrencyShort(pos.impliedValuation)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary mb-0.5">
                  Unrealized
                </div>
                <div className="text-xs font-mono text-vc-primary">
                  {formatCurrencyShort(pos.unrealizedValue)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
