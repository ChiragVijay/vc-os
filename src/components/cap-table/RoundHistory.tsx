"use client";

import { useMemo } from "react";
import type { CapTableEntry } from "@/src/lib/cap-table/types";
import {
  formatCurrencyShort,
  formatCurrencyFull,
  OUR_FUND_ID,
  OUR_FUND,
} from "@/src/lib/cap-table";

interface RoundHistoryProps {
  capTable: CapTableEntry;
}

export const RoundHistory = ({ capTable }: RoundHistoryProps) => {
  const rows = useMemo(() => {
    return capTable.rounds.map((round) => {
      const ourInvestor = round.investors.find(
        (inv) => inv.shareholderId === OUR_FUND_ID
      );
      return {
        ...round,
        ourParticipation: ourInvestor ? ourInvestor.amount : 0,
      };
    });
  }, [capTable]);

  if (rows.length === 0) {
    return (
      <div className="border border-vc-border p-4 sm:p-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
          Funding Rounds
        </div>
        <p className="text-xs text-vc-tertiary">No funding rounds recorded.</p>
      </div>
    );
  }

  return (
    <div className="border border-vc-border p-4 sm:p-6">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4 sm:mb-6">
        Funding Rounds
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              {[
                "Round",
                "Date",
                "Pre-Money",
                "Raised",
                "Post-Money",
                "Price/Share",
                "Lead",
                `${OUR_FUND}`,
                "Founder Own.",
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
            {rows.map((round, idx) => (
              <tr
                key={round.id}
                className="border-b border-vc-border last:border-0 hover:bg-vc-hover"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                      {idx < rows.length - 1 && (
                        <span className="absolute top-3 left-[4px] w-px h-6 bg-vc-border" />
                      )}
                    </div>
                    <span className="text-xs font-mono font-medium text-vc-primary">
                      {round.name}
                    </span>
                  </div>
                </td>
                <td className="text-xs font-mono text-vc-secondary px-3 py-3 whitespace-nowrap">
                  {new Date(round.date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="text-xs font-mono text-vc-primary px-3 py-3">
                  {formatCurrencyShort(round.preMoney)}
                </td>
                <td className="text-xs font-mono text-vc-primary px-3 py-3">
                  {formatCurrencyShort(round.roundSize)}
                </td>
                <td className="text-xs font-mono text-vc-primary px-3 py-3">
                  {formatCurrencyShort(round.postMoney)}
                </td>
                <td className="text-xs font-mono text-vc-primary px-3 py-3">
                  ${round.sharePrice.toFixed(4)}
                </td>
                <td className="text-xs font-mono text-vc-secondary px-3 py-3 whitespace-nowrap">
                  {round.leadInvestor}
                </td>
                <td className="px-3 py-3">
                  {round.ourParticipation > 0 ? (
                    <span className="text-xs font-mono text-accent font-medium">
                      {formatCurrencyFull(round.ourParticipation)}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-vc-border">—</span>
                  )}
                </td>
                <td className="text-xs font-mono text-vc-primary px-3 py-3">
                  {round.founderOwnershipAfter.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {rows.map((round, idx) => (
          <div key={round.id} className="border border-vc-border p-3">
            {/* Round header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  {idx < rows.length - 1 && (
                    <span className="absolute top-3 left-[4px] w-px h-4 bg-vc-border" />
                  )}
                </div>
                <span className="text-sm font-mono font-medium text-vc-primary">
                  {round.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-vc-secondary">
                {new Date(round.date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Pre-Money</div>
                <div className="text-xs font-mono text-vc-primary">{formatCurrencyShort(round.preMoney)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Raised</div>
                <div className="text-xs font-mono text-vc-primary">{formatCurrencyShort(round.roundSize)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Post-Money</div>
                <div className="text-xs font-mono text-vc-primary">{formatCurrencyShort(round.postMoney)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Price/Share</div>
                <div className="text-xs font-mono text-vc-primary">${round.sharePrice.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Lead</div>
                <div className="text-xs font-mono text-vc-secondary truncate">{round.leadInvestor}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-vc-secondary">Founder Own.</div>
                <div className="text-xs font-mono text-vc-primary">{round.founderOwnershipAfter.toFixed(1)}%</div>
              </div>
            </div>

            {/* Our participation */}
            {round.ourParticipation > 0 && (
              <div className="mt-2 pt-2 border-t border-vc-border flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                  {OUR_FUND}
                </span>
                <span className="text-xs font-mono text-accent font-medium">
                  {formatCurrencyFull(round.ourParticipation)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
