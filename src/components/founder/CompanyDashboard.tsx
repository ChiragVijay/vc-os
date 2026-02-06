"use client";

import { PenLine, RotateCcw } from "lucide-react";
import { MetricCard } from "@/src/components/dashboard/MetricCard";
import { SparklineChart } from "@/src/components/dashboard/SparklineChart";
import { TrendIndicator } from "@/src/components/dashboard/TrendIndicator";
import {
  avgRecentGrowth,
} from "@/src/lib/founder";
import { formatCurrency } from "@/src/lib/dashboard";
import type { FounderProfile } from "@/src/lib/founder";

interface CompanyDashboardProps {
  profile: FounderProfile;
  onEdit: () => void;
  onReset: () => void;
}

export const CompanyDashboard = ({
  profile,
  onEdit,
  onReset,
}: CompanyDashboardProps) => {
  const { company, snapshots } = profile;
  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  const avgGrowth = avgRecentGrowth(snapshots, 3);

  const mrrDelta = previous
    ? ((latest.mrr - previous.mrr) / previous.mrr) * 100
    : null;
  const customerDelta = previous
    ? ((latest.customers - previous.customers) / previous.customers) * 100
    : null;
  const burnDelta = previous
    ? ((latest.burn - previous.burn) / previous.burn) * 100
    : null;
  const churnDelta = previous
    ? latest.churnRate - previous.churnRate
    : null;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Company Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-serif font-light">{company.name}</h1>
            {profile.isDemo && (
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent border border-accent px-2 py-0.5">
                Demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-vc-secondary">
            <span>{company.sector}</span>
            <span className="text-vc-border">·</span>
            <span>{company.batch}</span>
            <span className="text-vc-border">·</span>
            <span>{company.stage}</span>
            <span className="text-vc-border">·</span>
            <span>{company.teamSize} people</span>
          </div>
          <p className="text-xs text-vc-tertiary mt-2 max-w-lg leading-relaxed">
            {company.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-vc-secondary hover:text-vc-primary border border-vc-border hover:border-vc-primary/30 transition-colors"
          >
            <PenLine className="w-3 h-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-vc-secondary hover:text-rose-500 border border-vc-border hover:border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard
          label="MRR"
          value={formatCurrency(latest.mrr, true)}
          delta={mrrDelta}
          deltaLabel="MoM"
        />
        <MetricCard
          label="ARR"
          value={formatCurrency(latest.mrr * 12, true)}
          delta={mrrDelta}
          deltaLabel="MoM"
        />
        <MetricCard
          label="Customers"
          value={latest.customers.toString()}
          delta={customerDelta}
          deltaLabel="MoM"
        />
        <MetricCard
          label="Churn Rate"
          value={`${latest.churnRate.toFixed(1)}%`}
          delta={churnDelta}
          invertDelta
        />
        <MetricCard
          label="Burn Rate"
          value={formatCurrency(latest.burn, true)}
          delta={burnDelta}
          invertDelta
        />
        <MetricCard
          label="Runway"
          value={`${latest.runway.toFixed(0)}mo`}
          delta={null}
        />
      </div>

      {/* Sparkline Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "MRR Trend", data: sorted.map((s) => ({ value: s.mrr })) },
          {
            label: "Customer Growth",
            data: sorted.map((s) => ({ value: s.customers })),
          },
          {
            label: "Burn Rate",
            data: sorted.map((s) => ({ value: s.burn })),
          },
          {
            label: "NPS",
            data: sorted.map((s) => ({ value: s.nps })),
          },
        ].map((chart) => (
          <div key={chart.label} className="border border-vc-border px-3 py-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
              {chart.label}
            </div>
            <SparklineChart data={chart.data} width={160} height={36} />
          </div>
        ))}
      </div>

      {/* Key Indicators */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
            Avg MoM Growth (3mo)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light">
              {avgGrowth.toFixed(1)}%
            </span>
            <TrendIndicator value={avgGrowth} showValue={false} />
          </div>
        </div>
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
            LTV:CAC Ratio
          </div>
          <div className="text-xl font-light">
            {latest.cac > 0
              ? `${(latest.ltv / latest.cac).toFixed(1)}x`
              : "N/A"}
          </div>
        </div>
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
            Revenue:Burn
          </div>
          <div className="text-xl font-light">
            {latest.burn > 0
              ? `${((latest.mrr / latest.burn) * 100).toFixed(0)}%`
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};
