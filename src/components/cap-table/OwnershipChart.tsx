"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CapTableEntry } from "@/src/lib/cap-table/types";
import {
  formatCurrencyShort,
  formatShareCount,
  formatPercent,
  OUR_FUND,
} from "@/src/lib/cap-table";

interface OwnershipChartProps {
  capTable: CapTableEntry;
}

const COLORS: Record<string, string> = {
  founder: "#111111",
  fund: "#f26522",
  angel: "#3b82f6",
  employee: "#8b5cf6",
  "option-pool": "#d4d4d4",
};

const TYPE_LABELS: Record<string, string> = {
  founder: "Founder",
  fund: "Fund",
  angel: "Angel",
  employee: "Employee",
  "option-pool": "Option Pool",
};

interface ChartDatum {
  name: string;
  value: number;
  color: string;
  type: string;
  shares: number;
  invested: number;
}

export const OwnershipChart = ({ capTable }: OwnershipChartProps) => {
  const chartData = useMemo(() => {
    const shareholderMap = new Map(
      capTable.shareholders.map((s) => [s.id, s])
    );

    // Aggregate by shareholder
    const aggregated = new Map<
      string,
      { name: string; type: string; shares: number; pct: number; invested: number }
    >();

    for (const h of capTable.holdings) {
      const sh = shareholderMap.get(h.shareholderId);
      if (!sh) continue;
      const existing = aggregated.get(h.shareholderId);
      if (existing) {
        existing.shares += h.shares;
        existing.pct += h.ownershipPct;
        existing.invested += h.investmentAmount;
      } else {
        aggregated.set(h.shareholderId, {
          name: sh.name,
          type: sh.type,
          shares: h.shares,
          pct: h.ownershipPct,
          invested: h.investmentAmount,
        });
      }
    }

    // Sort: founders first, then by ownership desc
    const entries = [...aggregated.values()].sort((a, b) => {
      if (a.type === "founder" && b.type !== "founder") return -1;
      if (b.type === "founder" && a.type !== "founder") return 1;
      if (a.type === "option-pool") return 1;
      if (b.type === "option-pool") return -1;
      return b.pct - a.pct;
    });

    return entries.map((e, i) => ({
      name: e.name,
      value: e.pct,
      color:
        e.name === OUR_FUND
          ? "#f26522"
          : COLORS[e.type] || `hsl(${(i * 47) % 360}, 50%, 50%)`,
      type: e.type,
      shares: e.shares,
      invested: e.invested,
    })) as ChartDatum[];
  }, [capTable]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: ChartDatum }[];
  }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-vc-border px-3 py-2 shadow-sm">
        <p className="text-xs font-mono font-medium text-vc-primary">{d.name}</p>
        <p className="text-xs font-mono text-vc-secondary">
          {d.value.toFixed(2)}% &middot; {formatShareCount(d.shares)} shares
        </p>
        {d.invested > 0 && (
          <p className="text-xs font-mono text-vc-secondary">
            Invested: {formatCurrencyShort(d.invested)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="border border-vc-border p-4 sm:p-6">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4 sm:mb-6">
        Ownership Breakdown
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Donut Chart */}
        <div className="w-full lg:w-[280px] h-[220px] sm:h-[280px] shrink-0 mx-auto lg:mx-0" style={{ maxWidth: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="85%"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings -- Table on desktop, compact list on mobile */}
        <div className="flex-1 min-w-0">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  {["Shareholder", "Type", "Shares", "Ownership", "Invested"].map(
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
                {chartData.map((d) => (
                  <tr
                    key={d.name}
                    className="border-b border-vc-border last:border-0 hover:bg-vc-hover"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span
                          className={`text-xs font-mono ${
                            d.name === OUR_FUND
                              ? "text-accent font-medium"
                              : "text-vc-primary"
                          }`}
                        >
                          {d.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-vc-secondary px-3 py-2">
                      {TYPE_LABELS[d.type] || d.type}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatShareCount(d.shares)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {formatPercent(d.value)}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {d.invested > 0 ? formatCurrencyShort(d.invested) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile compact list */}
          <div className="sm:hidden divide-y divide-vc-border">
            {chartData.map((d) => (
              <div key={d.name} className="py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span
                      className={`text-xs font-mono truncate ${
                        d.name === OUR_FUND
                          ? "text-accent font-medium"
                          : "text-vc-primary"
                      }`}
                    >
                      {d.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-vc-primary shrink-0 ml-2">
                    {formatPercent(d.value)}
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-4 text-[10px] font-mono text-vc-secondary">
                  <span>{TYPE_LABELS[d.type] || d.type}</span>
                  <span>{formatShareCount(d.shares)} shares</span>
                  {d.invested > 0 && <span>{formatCurrencyShort(d.invested)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
