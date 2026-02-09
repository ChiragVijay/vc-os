"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { CapTableEntry } from "@/src/lib/cap-table/types";
import {
  computeWaterfall,
  computeSensitivity,
  formatCurrencyShort,
  OUR_FUND,
} from "@/src/lib/cap-table";
import { TrendingUp } from "lucide-react";

interface WaterfallSimulatorProps {
  capTable: CapTableEntry;
}

const CLASS_COLORS: Record<string, string> = {
  Common: "#111111",
  "Series Seed": "#3b82f6",
  "Series A": "#8b5cf6",
  "Option Pool": "#d4d4d4",
  "Our Fund": "#f26522",
};

export const WaterfallSimulator = ({ capTable }: WaterfallSimulatorProps) => {
  const lastRound = capTable.rounds[capTable.rounds.length - 1];
  const lastPostMoney = lastRound?.postMoney ?? 10_000_000;
  const maxExit = lastPostMoney * 10;

  const [exitValuation, setExitValuation] = useState(lastPostMoney * 3);

  const waterfall = useMemo(
    () => computeWaterfall(capTable, exitValuation),
    [capTable, exitValuation]
  );

  const sensitivity = useMemo(
    () => computeSensitivity(capTable, 25, maxExit),
    [capTable, maxExit]
  );

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: number;
  }) => {
    if (!active || !payload || !label) return null;
    return (
      <div className="bg-white border border-vc-border px-3 py-2 shadow-sm">
        <p className="text-xs font-mono font-medium text-vc-primary mb-1">
          Exit: {formatCurrencyShort(label)}
        </p>
        {payload
          .filter((p) => p.name !== "exitValuation")
          .reverse()
          .map((p) => (
            <p key={p.name} className="text-[11px] font-mono" style={{ color: p.color }}>
              {p.name}: {formatCurrencyShort(p.value)}
            </p>
          ))}
      </div>
    );
  };

  return (
    <div className="border border-vc-border p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <TrendingUp className="w-4 h-4 text-accent" />
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          Exit Waterfall Simulator
        </div>
      </div>

      {/* Exit Valuation Slider */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary">
            Exit Valuation
          </label>
          <span className="text-lg sm:text-xl font-light text-vc-primary">
            {formatCurrencyShort(exitValuation)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxExit}
          step={Math.round(maxExit / 100)}
          value={exitValuation}
          onChange={(e) => setExitValuation(Number(e.target.value))}
          className="w-full h-2 sm:h-1.5 bg-vc-border rounded-full appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-[10px] font-mono text-vc-border mt-1">
          <span>$0</span>
          <span>{formatCurrencyShort(maxExit)}</span>
        </div>
      </div>

      {/* Fund Callout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="border border-accent/30 bg-accent/5 px-3 sm:px-4 py-3">
          <div className="text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-accent mb-1">
            {OUR_FUND} Proceeds
          </div>
          <div className="text-lg sm:text-2xl font-light text-accent">
            {formatCurrencyShort(waterfall.fundProceeds)}
          </div>
        </div>
        <div className="border border-accent/30 bg-accent/5 px-3 sm:px-4 py-3">
          <div className="text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-accent mb-1">
            Fund MOIC
          </div>
          <div className="text-lg sm:text-2xl font-light text-accent">
            {waterfall.fundMoic.toFixed(1)}x
          </div>
        </div>
        <div className="border border-accent/30 bg-accent/5 px-3 sm:px-4 py-3">
          <div className="text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-accent mb-1">
            Est. IRR
          </div>
          <div className="text-lg sm:text-2xl font-light text-accent">
            {waterfall.fundIrr !== null ? `${waterfall.fundIrr.toFixed(0)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Waterfall Distribution */}
      <div className="mb-6 sm:mb-8">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-3">
          Distribution Waterfall
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black">
                {[
                  "Share Class",
                  "Invested",
                  "Liq. Pref",
                  "Participation",
                  "Common Dist.",
                  "Total",
                  "MOIC",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary px-3 py-2 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waterfall.rows.map((row) => (
                <tr
                  key={row.shareClass}
                  className="border-b border-vc-border last:border-0 hover:bg-vc-hover"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            CLASS_COLORS[row.shareClass] || "#999",
                        }}
                      />
                      <span className="text-xs font-mono text-vc-primary">
                        {row.shareClass}
                      </span>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-vc-secondary px-3 py-2">
                    {row.investedAmount > 0
                      ? formatCurrencyShort(row.investedAmount)
                      : "—"}
                  </td>
                  <td className="text-xs font-mono text-vc-primary px-3 py-2">
                    {row.liquidationPayout > 0
                      ? formatCurrencyShort(row.liquidationPayout)
                      : "—"}
                  </td>
                  <td className="text-xs font-mono text-vc-primary px-3 py-2">
                    {row.participationPayout > 0
                      ? formatCurrencyShort(row.participationPayout)
                      : "—"}
                  </td>
                  <td className="text-xs font-mono text-vc-primary px-3 py-2">
                    {row.commonPayout > 0
                      ? formatCurrencyShort(row.commonPayout)
                      : "—"}
                  </td>
                  <td className="text-xs font-mono font-medium text-vc-primary px-3 py-2">
                    {formatCurrencyShort(row.totalProceeds)}
                  </td>
                  <td
                    className={`text-xs font-mono font-medium px-3 py-2 ${
                      row.moic >= 3
                        ? "text-emerald-600"
                        : row.moic >= 1
                          ? "text-vc-primary"
                          : row.moic > 0
                            ? "text-rose-500"
                            : "text-vc-secondary"
                    }`}
                  >
                    {row.investedAmount > 0 ? `${row.moic.toFixed(1)}x` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile waterfall cards */}
        <div className="sm:hidden space-y-2">
          {waterfall.rows.map((row) => (
            <div key={row.shareClass} className="border border-vc-border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CLASS_COLORS[row.shareClass] || "#999" }}
                  />
                  <span className="text-xs font-mono font-medium text-vc-primary">
                    {row.shareClass}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-medium ${
                    row.moic >= 3
                      ? "text-emerald-600"
                      : row.moic >= 1
                        ? "text-vc-primary"
                        : row.moic > 0
                          ? "text-rose-500"
                          : "text-vc-secondary"
                  }`}
                >
                  {row.investedAmount > 0 ? `${row.moic.toFixed(1)}x` : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-vc-secondary">Invested</span>
                  <span className="text-vc-primary">{row.investedAmount > 0 ? formatCurrencyShort(row.investedAmount) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vc-secondary">Total</span>
                  <span className="text-vc-primary font-medium">{formatCurrencyShort(row.totalProceeds)}</span>
                </div>
                {row.liquidationPayout > 0 && (
                  <div className="flex justify-between">
                    <span className="text-vc-secondary">Liq Pref</span>
                    <span className="text-vc-primary">{formatCurrencyShort(row.liquidationPayout)}</span>
                  </div>
                )}
                {row.participationPayout > 0 && (
                  <div className="flex justify-between">
                    <span className="text-vc-secondary">Participation</span>
                    <span className="text-vc-primary">{formatCurrencyShort(row.participationPayout)}</span>
                  </div>
                )}
                {row.commonPayout > 0 && (
                  <div className="flex justify-between">
                    <span className="text-vc-secondary">Common Dist</span>
                    <span className="text-vc-primary">{formatCurrencyShort(row.commonPayout)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity Chart */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-3">
          Proceeds Sensitivity
        </div>
        <div className="h-[220px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sensitivity}>
              <XAxis
                dataKey="exitValuation"
                tick={{ fontSize: 9, fontFamily: "monospace" }}
                tickFormatter={(v) => formatCurrencyShort(v)}
                stroke="#d4d4d4"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fontFamily: "monospace" }}
                tickFormatter={(v) => formatCurrencyShort(v)}
                stroke="#d4d4d4"
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={exitValuation}
                stroke="#f26522"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="Common"
                stackId="1"
                stroke="#111111"
                fill="#111111"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="Series Seed"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="Series A"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="Option Pool"
                stackId="1"
                stroke="#d4d4d4"
                fill="#d4d4d4"
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 justify-center">
          {Object.entries(CLASS_COLORS)
            .filter(([key]) => key !== "Our Fund")
            .map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[9px] sm:text-[10px] font-mono text-vc-secondary">
                  {name}
                </span>
              </div>
            ))}
          <div className="flex items-center gap-1.5">
            <span className="w-3 sm:w-4 border-t-2 border-dashed border-accent" />
            <span className="text-[9px] sm:text-[10px] font-mono text-vc-secondary">
              Selected Exit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
