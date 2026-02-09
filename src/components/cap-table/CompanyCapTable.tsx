"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCapTable, getPortfolioPosition, formatCurrencyShort } from "@/src/lib/cap-table";
import { getCompany } from "@/src/lib/dashboard";
import { MetricCard } from "@/src/components/dashboard/MetricCard";
import { OwnershipChart } from "./OwnershipChart";
import { RoundHistory } from "./RoundHistory";
import { RoundModeler } from "./RoundModeler";
import { WaterfallSimulator } from "./WaterfallSimulator";

interface CompanyCapTableProps {
  companyId: string;
}

export const CompanyCapTable = ({ companyId }: CompanyCapTableProps) => {
  const company = getCompany(companyId);
  const capTable = useMemo(() => getCapTable(companyId), [companyId]);
  const position = useMemo(() => getPortfolioPosition(companyId), [companyId]);

  if (!company || !capTable) {
    return (
      <div className="px-4 sm:px-6 py-16 max-w-7xl mx-auto text-center">
        <p className="text-xs font-mono text-vc-secondary uppercase tracking-[0.2em]">
          Company not found
        </p>
      </div>
    );
  }

  const lastRound = capTable.rounds[capTable.rounds.length - 1];

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/cap-table"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-vc-secondary hover:text-accent transition-colors mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Portfolio
      </Link>

      {/* Company Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-vc-border">
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 shrink-0"
            style={{ backgroundColor: company.logoColor }}
          />
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-vc-primary">
            {company.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.sector}
          </span>
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.stage}
          </span>
          <span className="text-xs font-mono px-2 py-1 border border-vc-border text-vc-secondary">
            {company.batch}
          </span>
        </div>
      </div>

      <p className="text-sm text-vc-tertiary mb-6 sm:mb-8 max-w-2xl">
        {company.description}
      </p>

      {/* Investment KPIs */}
      {position && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 border border-vc-border mb-6 sm:mb-8">
          <MetricCard
            label="Our Investment"
            value={formatCurrencyShort(position.checkSize)}
            compact
          />
          <MetricCard
            label="Ownership"
            value={`${position.ownershipPct.toFixed(1)}%`}
            compact
          />
          <MetricCard
            label="Implied Value"
            value={formatCurrencyShort(position.impliedValuation)}
            compact
          />
          <MetricCard
            label="Unrealized"
            value={formatCurrencyShort(position.unrealizedValue)}
            compact
          />
          <MetricCard
            label="MOIC"
            value={`${position.moic.toFixed(1)}x`}
            compact
          />
          <MetricCard
            label="Last Round"
            value={lastRound ? formatCurrencyShort(lastRound.postMoney) : "—"}
            compact
          />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6 sm:space-y-8">
        <OwnershipChart capTable={capTable} />
        <RoundHistory capTable={capTable} />
        <RoundModeler capTable={capTable} />
        <WaterfallSimulator capTable={capTable} />
      </div>
    </div>
  );
};
