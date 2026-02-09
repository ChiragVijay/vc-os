"use client";

import { useState, useMemo } from "react";
import type { CapTableEntry } from "@/src/lib/cap-table/types";
import {
  modelNewRound,
  formatCurrencyShort,
  formatCurrencyFull,
} from "@/src/lib/cap-table";
import { INPUT_CLASS } from "@/src/lib/constants";
import { Calculator, ArrowRight } from "lucide-react";

interface RoundModelerProps {
  capTable: CapTableEntry;
}

export const RoundModeler = ({ capTable }: RoundModelerProps) => {
  // Default values based on last round
  const lastRound = capTable.rounds[capTable.rounds.length - 1];
  const defaultPreMoney = lastRound ? lastRound.postMoney * 2.5 : 10_000_000;

  const [name, setName] = useState(
    lastRound?.name === "Series A" ? "Series B" : lastRound?.name === "Seed" ? "Series A" : "Seed"
  );
  const [preMoney, setPreMoney] = useState(defaultPreMoney);
  const [roundSize, setRoundSize] = useState(Math.round(defaultPreMoney * 0.25));
  const [ourAllocation, setOurAllocation] = useState(
    Math.round(defaultPreMoney * 0.25 * 0.1)
  );

  const result = useMemo(() => {
    if (preMoney <= 0 || roundSize <= 0) return null;
    return modelNewRound(capTable, { name, preMoney, roundSize, ourAllocation });
  }, [capTable, name, preMoney, roundSize, ourAllocation]);

  const parseInput = (val: string): number => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="border border-vc-border p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Calculator className="w-4 h-4 text-accent" />
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          Round Modeler
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1.5">
            Round Name
          </label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${INPUT_CLASS} w-full`}
          >
            <option value="Pre-Seed">Pre-Seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1.5">
            Pre-Money
          </label>
          <input
            type="text"
            value={formatCurrencyFull(preMoney)}
            onChange={(e) => setPreMoney(parseInput(e.target.value))}
            className={`${INPUT_CLASS} w-full`}
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1.5">
            Round Size
          </label>
          <input
            type="text"
            value={formatCurrencyFull(roundSize)}
            onChange={(e) => setRoundSize(parseInput(e.target.value))}
            className={`${INPUT_CLASS} w-full`}
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1.5">
            Our Allocation
          </label>
          <input
            type="text"
            value={formatCurrencyFull(ourAllocation)}
            onChange={(e) => setOurAllocation(parseInput(e.target.value))}
            className={`${INPUT_CLASS} w-full`}
          />
        </div>
      </div>

      {/* Computed Metrics */}
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="border border-vc-border bg-vc-hover px-3 py-3">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1">
                Post-Money
              </div>
              <div className="text-base sm:text-lg font-light text-vc-primary">
                {formatCurrencyShort(result.postMoney)}
              </div>
            </div>
            <div className="border border-vc-border bg-vc-hover px-3 py-3">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1">
                Share Price
              </div>
              <div className="text-base sm:text-lg font-light text-vc-primary">
                ${result.newSharePrice.toFixed(4)}
              </div>
            </div>
            <div className="border border-vc-border bg-vc-hover px-3 py-3">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1">
                New Dilution
              </div>
              <div className="text-base sm:text-lg font-light text-vc-primary">
                {((roundSize / (preMoney + roundSize)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="border border-vc-border bg-vc-hover px-3 py-3">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-1">
                Our Pro-Rata
              </div>
              <div className="text-base sm:text-lg font-light text-accent">
                {((ourAllocation / roundSize) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Dilution Table */}
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-vc-secondary mb-3">
            Dilution Impact
          </div>

          {/* Desktop dilution table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  {["Shareholder", "Before", "", "After", "Dilution"].map(
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
                {result.dilutionPreview.map((d) => (
                  <tr
                    key={d.shareholderId}
                    className="border-b border-vc-border last:border-0 hover:bg-vc-hover"
                  >
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {d.shareholderName}
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {d.beforePct.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2">
                      <ArrowRight className="w-3 h-3 text-vc-border" />
                    </td>
                    <td className="text-xs font-mono text-vc-primary px-3 py-2">
                      {d.afterPct.toFixed(2)}%
                    </td>
                    <td
                      className={`text-xs font-mono px-3 py-2 ${
                        d.dilution > 0
                          ? "text-rose-500"
                          : d.dilution < 0
                            ? "text-emerald-600"
                            : "text-vc-secondary"
                      }`}
                    >
                      {d.dilution > 0 ? `-${d.dilution.toFixed(2)}pp` : d.dilution === 0 ? "—" : `+${Math.abs(d.dilution).toFixed(2)}pp`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile dilution list */}
          <div className="sm:hidden divide-y divide-vc-border border-t border-vc-border">
            {result.dilutionPreview.map((d) => (
              <div key={d.shareholderId} className="py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-vc-primary truncate mr-2">
                    {d.shareholderName}
                  </span>
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      d.dilution > 0
                        ? "text-rose-500"
                        : d.dilution < 0
                          ? "text-emerald-600"
                          : "text-vc-secondary"
                    }`}
                  >
                    {d.dilution > 0 ? `-${d.dilution.toFixed(2)}pp` : d.dilution === 0 ? "—" : `+${Math.abs(d.dilution).toFixed(2)}pp`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-vc-secondary">
                  <span>{d.beforePct.toFixed(2)}%</span>
                  <ArrowRight className="w-2.5 h-2.5 text-vc-border" />
                  <span className="text-vc-primary">{d.afterPct.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
