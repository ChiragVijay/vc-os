import type {
  CapTableEntry,
  Holding,
  LiquidationPref,
  RoundModelParams,
  DilutionPreview,
  WaterfallResult,
  WaterfallRow,
  SensitivityPoint,
  PortfolioPosition,
  ShareClassName,
  FundingRound,
  RoundInvestor,
} from "./types";
import { OUR_FUND_ID } from "./mockData";

// ─── Ownership ───────────────────────────────────────────────────────────

export function recomputeOwnership(holdings: Holding[], totalShares: number): Holding[] {
  return holdings.map((h) => ({
    ...h,
    ownershipPct: Math.round((h.shares / totalShares) * 10000) / 100,
  }));
}

// ─── Round Modeling ──────────────────────────────────────────────────────

export function modelNewRound(
  capTable: CapTableEntry,
  params: RoundModelParams
): {
  dilutionPreview: DilutionPreview[];
  newSharePrice: number;
  postMoney: number;
  newTotalShares: number;
  newRound: FundingRound;
  newHoldings: Holding[];
} {
  const { name, preMoney, roundSize, ourAllocation } = params;
  const postMoney = preMoney + roundSize;
  const sharePrice = preMoney / capTable.totalShares;
  const newShares = Math.round(roundSize / sharePrice);
  const newTotalShares = capTable.totalShares + newShares;

  // Compute dilution for each existing shareholder
  const shareholderMap = new Map(capTable.shareholders.map((s) => [s.id, s.name]));
  const aggregated = new Map<string, { name: string; shares: number }>();

  for (const h of capTable.holdings) {
    const existing = aggregated.get(h.shareholderId);
    if (existing) {
      existing.shares += h.shares;
    } else {
      aggregated.set(h.shareholderId, {
        name: shareholderMap.get(h.shareholderId) || "Unknown",
        shares: h.shares,
      });
    }
  }

  const dilutionPreview: DilutionPreview[] = [];
  for (const [shId, data] of aggregated) {
    const beforePct = (data.shares / capTable.totalShares) * 100;
    // Add our new shares if this is our fund
    const additionalShares = shId === OUR_FUND_ID ? Math.round(ourAllocation / sharePrice) : 0;
    const afterPct = ((data.shares + additionalShares) / newTotalShares) * 100;
    dilutionPreview.push({
      shareholderId: shId,
      shareholderName: data.name,
      beforePct: Math.round(beforePct * 100) / 100,
      afterPct: Math.round(afterPct * 100) / 100,
      dilution: Math.round((beforePct - afterPct) * 100) / 100,
    });
  }

  // Add new investor entry
  const newInvestorAmount = roundSize - ourAllocation;
  if (newInvestorAmount > 0) {
    const newInvestorShares = Math.round(newInvestorAmount / sharePrice);
    dilutionPreview.push({
      shareholderId: "new_investor",
      shareholderName: "New Investor(s)",
      beforePct: 0,
      afterPct: Math.round((newInvestorShares / newTotalShares) * 10000) / 100,
      dilution: 0,
    });
  }

  // Our follow-on
  if (ourAllocation > 0) {
    const existing = dilutionPreview.find((d) => d.shareholderId === OUR_FUND_ID);
    if (!existing) {
      const ourNewShares = Math.round(ourAllocation / sharePrice);
      dilutionPreview.push({
        shareholderId: OUR_FUND_ID,
        shareholderName: "CVJ Capital",
        beforePct: 0,
        afterPct: Math.round((ourNewShares / newTotalShares) * 10000) / 100,
        dilution: 0,
      });
    }
  }

  // Sort by afterPct descending
  dilutionPreview.sort((a, b) => b.afterPct - a.afterPct);

  // Build the new round object
  const investors: RoundInvestor[] = [];
  if (ourAllocation > 0) {
    investors.push({
      shareholderId: OUR_FUND_ID,
      amount: ourAllocation,
      shares: Math.round(ourAllocation / sharePrice),
    });
  }
  if (newInvestorAmount > 0) {
    investors.push({
      shareholderId: "new_investor",
      amount: newInvestorAmount,
      shares: Math.round(newInvestorAmount / sharePrice),
    });
  }

  const founderShares = capTable.holdings
    .filter((h) => h.shareClass === "Common")
    .reduce((sum, h) => sum + h.shares, 0);
  const founderOwnershipAfter = (founderShares / newTotalShares) * 100;

  const newRound: FundingRound = {
    id: `round_modeled_${Date.now()}`,
    companyId: capTable.companyId,
    name,
    date: new Date().toISOString().slice(0, 10),
    preMoney,
    roundSize,
    postMoney,
    sharePrice,
    leadInvestor: "New Investor",
    investors,
    founderOwnershipAfter: Math.round(founderOwnershipAfter * 100) / 100,
  };

  // Build new holdings (clone existing + add new)
  const shareClass: ShareClassName = name === "Series A" ? "Series A" : "Series Seed";
  const newHoldings = capTable.holdings.map((h) => ({ ...h }));
  for (const inv of investors) {
    const existing = newHoldings.find(
      (h) => h.shareholderId === inv.shareholderId && h.shareClass === shareClass
    );
    if (existing) {
      existing.shares += inv.shares;
      existing.investmentAmount += inv.amount;
    } else {
      newHoldings.push({
        shareholderId: inv.shareholderId,
        shareClass,
        shares: inv.shares,
        ownershipPct: 0,
        investmentAmount: inv.amount,
      });
    }
  }

  // Recompute ownership
  const updatedHoldings = recomputeOwnership(newHoldings, newTotalShares);

  return {
    dilutionPreview,
    newSharePrice: sharePrice,
    postMoney,
    newTotalShares,
    newRound,
    newHoldings: updatedHoldings,
  };
}

// ─── Exit Waterfall ──────────────────────────────────────────────────────

export function computeWaterfall(
  capTable: CapTableEntry,
  exitValuation: number
): WaterfallResult {
  const { holdings, liquidationPrefs, totalShares } = capTable;

  // Group holdings by share class
  const classTotals = new Map<ShareClassName, { shares: number; invested: number }>();
  for (const h of holdings) {
    const existing = classTotals.get(h.shareClass);
    if (existing) {
      existing.shares += h.shares;
      existing.invested += h.investmentAmount;
    } else {
      classTotals.set(h.shareClass, { shares: h.shares, invested: h.investmentAmount });
    }
  }

  let remaining = exitValuation;
  const rows: WaterfallRow[] = [];

  // Preferred classes: Series A first, then Series Seed (standard seniority)
  const prefOrder: ShareClassName[] = ["Series A", "Series Seed"];
  const prefClasses = prefOrder.filter((cls) => classTotals.has(cls));

  // Step 1: Liquidation preferences
  const prefPayouts = new Map<ShareClassName, number>();
  for (const cls of prefClasses) {
    const pref = liquidationPrefs.find((lp) => lp.shareClass === cls);
    const classData = classTotals.get(cls)!;
    const multiple = pref?.multiple ?? 1;
    const prefAmount = Math.min(remaining, classData.invested * multiple);
    prefPayouts.set(cls, prefAmount);
    remaining -= prefAmount;
  }

  // Step 2: Participation (for participating preferred)
  const participationPayouts = new Map<ShareClassName, number>();
  for (const cls of prefClasses) {
    const pref = liquidationPrefs.find((lp) => lp.shareClass === cls);
    if (pref?.participating && remaining > 0) {
      const classData = classTotals.get(cls)!;
      const classPct = classData.shares / totalShares;
      let participationAmount = remaining * classPct;

      // Apply cap if applicable
      if (pref.participationCap !== null) {
        const maxTotal = classData.invested * pref.participationCap;
        const alreadyPaid = prefPayouts.get(cls) ?? 0;
        participationAmount = Math.min(participationAmount, Math.max(0, maxTotal - alreadyPaid));
      }

      participationPayouts.set(cls, participationAmount);
      remaining -= participationAmount;
    }
  }

  // Step 3: Remaining goes pro-rata to all shareholders (common conversion)
  // For non-participating preferred, they can choose to convert and get pro-rata
  // We compare: liq pref vs pro-rata, take the better one
  for (const cls of prefClasses) {
    const pref = liquidationPrefs.find((lp) => lp.shareClass === cls);
    const classData = classTotals.get(cls)!;
    const liqPayout = (prefPayouts.get(cls) ?? 0) + (participationPayouts.get(cls) ?? 0);

    if (!pref?.participating) {
      // Non-participating: check if converting to common is better
      const proRataAsCommon = (classData.shares / totalShares) * exitValuation;
      if (proRataAsCommon > liqPayout) {
        // Convert: give back liq pref, take pro-rata instead
        remaining += prefPayouts.get(cls) ?? 0;
        prefPayouts.set(cls, 0);
        // Will get common payout below
      }
    }
  }

  // Step 4: Common shares (including converted preferred) get remaining
  const commonPayouts = new Map<ShareClassName, number>();

  // Determine which classes participate in common distribution
  // (Common always does, non-participating preferred that converted does too)
  const commonClasses: ShareClassName[] = [];
  let commonShareTotal = 0;

  for (const [cls, data] of classTotals) {
    const pref = liquidationPrefs.find((lp) => lp.shareClass === cls);
    const isPreferred = cls !== "Common" && cls !== "Option Pool";

    if (!isPreferred) {
      // Common and Option Pool always participate
      commonClasses.push(cls);
      commonShareTotal += data.shares;
    } else if (!pref?.participating) {
      // Non-participating preferred that converted
      const liqPayout = prefPayouts.get(cls) ?? 0;
      if (liqPayout === 0) {
        // Was converted
        commonClasses.push(cls);
        commonShareTotal += data.shares;
      }
    }
  }

  for (const cls of commonClasses) {
    const classData = classTotals.get(cls)!;
    const payout = commonShareTotal > 0 ? (classData.shares / commonShareTotal) * remaining : 0;
    commonPayouts.set(cls, payout);
  }

  // Build rows
  const allClasses: ShareClassName[] = ["Common", "Series Seed", "Series A", "Option Pool"];
  for (const cls of allClasses) {
    const classData = classTotals.get(cls);
    if (!classData) continue;

    const invested = classData.invested;
    const liquidationPayout = prefPayouts.get(cls) ?? 0;
    const participationPayout = participationPayouts.get(cls) ?? 0;
    const commonPayout = commonPayouts.get(cls) ?? 0;
    const total = liquidationPayout + participationPayout + commonPayout;

    rows.push({
      shareClass: cls,
      investedAmount: invested,
      liquidationPayout,
      participationPayout,
      commonPayout,
      totalProceeds: Math.round(total),
      moic: invested > 0 ? Math.round((total / invested) * 100) / 100 : 0,
    });
  }

  // Fund-specific metrics
  const fundHoldings = holdings.filter((h) => h.shareholderId === OUR_FUND_ID);
  const fundInvested = fundHoldings.reduce((sum, h) => sum + h.investmentAmount, 0);
  let fundProceeds = 0;
  for (const h of fundHoldings) {
    const classData = classTotals.get(h.shareClass);
    if (!classData || classData.shares === 0) continue;
    const classRow = rows.find((r) => r.shareClass === h.shareClass);
    if (classRow) {
      fundProceeds += classRow.totalProceeds * (h.shares / classData.shares);
    }
  }

  const fundMoic = fundInvested > 0 ? Math.round((fundProceeds / fundInvested) * 100) / 100 : 0;

  // Simple IRR approximation (assumes ~2 year hold for established, 1 year for newer)
  const avgRoundDate = capTable.rounds.length > 0
    ? capTable.rounds.reduce((sum, r) => sum + new Date(r.date).getTime(), 0) / capTable.rounds.length
    : Date.now();
  const yearsHeld = Math.max(0.5, (Date.now() - avgRoundDate) / (365.25 * 24 * 3600 * 1000));
  const fundIrr = fundInvested > 0 && fundProceeds > 0
    ? Math.round((Math.pow(fundProceeds / fundInvested, 1 / yearsHeld) - 1) * 10000) / 100
    : null;

  return {
    rows,
    fundProceeds: Math.round(fundProceeds),
    fundMoic,
    fundIrr,
    exitValuation,
  };
}

// ─── Sensitivity Analysis ────────────────────────────────────────────────

export function computeSensitivity(
  capTable: CapTableEntry,
  steps: number = 20,
  maxExit?: number
): SensitivityPoint[] {
  // Determine a reasonable max exit
  const lastRound = capTable.rounds[capTable.rounds.length - 1];
  const lastPostMoney = lastRound?.postMoney ?? 10_000_000;
  const max = maxExit ?? lastPostMoney * 10;
  const stepSize = max / steps;

  const points: SensitivityPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const exitVal = Math.round(stepSize * i);
    const result = computeWaterfall(capTable, exitVal);
    const point: SensitivityPoint = { exitValuation: exitVal };
    for (const row of result.rows) {
      point[row.shareClass] = row.totalProceeds;
    }
    point["Our Fund"] = result.fundProceeds;
    points.push(point);
  }

  return points;
}

// ─── Portfolio Aggregates ────────────────────────────────────────────────

export interface PortfolioSummary {
  totalDeployed: number;
  totalFairValue: number;
  blendedMoic: number;
  avgOwnership: number;
  activePositions: number;
}

export function computePortfolioSummary(positions: PortfolioPosition[]): PortfolioSummary {
  const active = positions.filter((p) => p.checkSize > 0);
  const totalDeployed = active.reduce((sum, p) => sum + p.checkSize, 0);
  const totalFairValue = active.reduce((sum, p) => sum + p.unrealizedValue, 0);
  const blendedMoic = totalDeployed > 0 ? Math.round((totalFairValue / totalDeployed) * 100) / 100 : 0;
  const avgOwnership = active.length > 0
    ? Math.round((active.reduce((sum, p) => sum + p.ownershipPct, 0) / active.length) * 100) / 100
    : 0;

  return {
    totalDeployed,
    totalFairValue,
    blendedMoic,
    avgOwnership,
    activePositions: active.length,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────

export function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShareCount(shares: number): string {
  if (shares >= 1_000_000) return `${(shares / 1_000_000).toFixed(2)}M`;
  if (shares >= 1_000) return `${(shares / 1_000).toFixed(0)}K`;
  return shares.toString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
