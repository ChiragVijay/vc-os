import { companies } from "@/src/lib/dashboard/mockData";
import { getSnapshots } from "@/src/lib/dashboard";
import type {
  CapTableEntry,
  Shareholder,
  Holding,
  FundingRound,
  LiquidationPref,
  RoundInvestor,
  PortfolioPosition,
  ShareClassName,
} from "./types";
import type { Company } from "@/src/lib/dashboard/types";

// ─── Deterministic random (same approach as dashboard) ───────────────────

function seededRandom(seed: string, index: number): number {
  let h = 0;
  const s = seed + index.toString();
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return ((h & 0x7fffffff) % 10000) / 10000;
}

function pick<T>(arr: T[], seed: string, idx: number): T {
  return arr[Math.floor(seededRandom(seed, idx) * arr.length)];
}

// ─── Constants ───────────────────────────────────────────────────────────

const OUR_FUND = "CVJ Capital";
const OUR_FUND_ID = "sh_fund_cvj";

const ANGEL_NAMES = [
  "Ravi Sundaram",
  "Elena Forster",
  "Marcus Ibarra",
  "Priya Lakshman",
  "James Orwell",
  "Dana Kowalski",
  "Leo Ashworth",
  "Nina Calloway",
];

const SEED_FUNDS = [
  "Northstar Seed",
  "Arclight Ventures",
  "Cornerstone Capital",
  "Basecamp Fund",
  "Ember Partners",
  "Ridgeline Ventures",
];

const SERIES_A_FUNDS = [
  "Summit Partners",
  "Ironbridge Capital",
  "Clearpath Ventures",
  "Vanguard Growth",
  "Redwood Capital",
  "Sterling Ventures",
];

const FOUNDER_FIRST_NAMES = [
  "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn",
  "Avery", "Blake", "Cameron", "Drew", "Ellis", "Frankie", "Harper", "Kai",
];

const FOUNDER_LAST_NAMES = [
  "Chen", "Patel", "Kim", "Singh", "Wu", "Garcia", "Lee", "Nakamura",
  "Okafor", "Andersen", "Roth", "Liu", "Shah", "Ito", "Costa", "Berg",
];

// ─── Valuation profiles by stage ─────────────────────────────────────────

interface StageConfig {
  rounds: { name: string; shareClass: ShareClassName }[];
  preSeedPreMoney: [number, number]; // min, max
  seedPreMoney: [number, number];
  seriesAPreMoney: [number, number];
  preSeedSize: [number, number];
  seedSize: [number, number];
  seriesASize: [number, number];
}

const STAGE_CONFIG: StageConfig = {
  rounds: [
    { name: "Pre-Seed", shareClass: "Series Seed" },
    { name: "Seed", shareClass: "Series Seed" },
    { name: "Series A", shareClass: "Series A" },
  ],
  preSeedPreMoney: [3_000_000, 8_000_000],
  seedPreMoney: [8_000_000, 20_000_000],
  seriesAPreMoney: [25_000_000, 60_000_000],
  preSeedSize: [500_000, 2_000_000],
  seedSize: [2_000_000, 5_000_000],
  seriesASize: [8_000_000, 20_000_000],
};

function lerp(min: number, max: number, t: number): number {
  return Math.round(min + (max - min) * t);
}

// ─── Generate cap table for one company ──────────────────────────────────

function generateCapTable(company: Company): CapTableEntry {
  const sid = company.id;
  const shareholders: Shareholder[] = [];
  const holdings: Holding[] = [];
  const rounds: FundingRound[] = [];
  const liquidationPrefs: LiquidationPref[] = [];

  // ── 1. Founders (2-4) ──────────────────────────────────────────────
  const founderCount = 2 + Math.floor(seededRandom(sid, 0) * 3); // 2-4
  const founderNames: string[] = [];
  for (let i = 0; i < founderCount; i++) {
    const first = pick(FOUNDER_FIRST_NAMES, sid + "fn", i);
    const last = pick(FOUNDER_LAST_NAMES, sid + "ln", i);
    const name = `${first} ${last}`;
    founderNames.push(name);
    shareholders.push({
      id: `sh_founder_${sid}_${i}`,
      name,
      type: "founder",
    });
  }

  // Initial share count: 10M total
  const INITIAL_SHARES = 10_000_000;
  const founderShares = INITIAL_SHARES;
  const sharesPerFounder = Math.floor(founderShares / founderCount);

  // ── 2. Option Pool ─────────────────────────────────────────────────
  const optionPoolPct = 10 + Math.floor(seededRandom(sid, 10) * 6); // 10-15%
  const optionPoolShares = Math.round((INITIAL_SHARES * optionPoolPct) / (100 - optionPoolPct));
  shareholders.push({
    id: `sh_optpool_${sid}`,
    name: "Employee Option Pool",
    type: "option-pool",
  });

  let totalShares = INITIAL_SHARES + optionPoolShares;

  // Give each founder their share
  for (let i = 0; i < founderCount; i++) {
    holdings.push({
      shareholderId: `sh_founder_${sid}_${i}`,
      shareClass: "Common",
      shares: sharesPerFounder,
      ownershipPct: 0, // will be computed later
      investmentAmount: 0,
    });
  }

  holdings.push({
    shareholderId: `sh_optpool_${sid}`,
    shareClass: "Option Pool",
    shares: optionPoolShares,
    ownershipPct: 0,
    investmentAmount: 0,
  });

  // ── 3. Our fund ────────────────────────────────────────────────────
  shareholders.push({
    id: OUR_FUND_ID,
    name: OUR_FUND,
    type: "fund",
  });

  // ── 4. Determine which rounds the company has had ──────────────────
  const roundConfigs: { name: string; shareClass: ShareClassName; preMoneyRange: [number, number]; sizeRange: [number, number] }[] = [];

  if (company.stage === "Pre-Seed") {
    roundConfigs.push({
      name: "Pre-Seed",
      shareClass: "Series Seed",
      preMoneyRange: STAGE_CONFIG.preSeedPreMoney,
      sizeRange: STAGE_CONFIG.preSeedSize,
    });
  } else if (company.stage === "Seed") {
    roundConfigs.push({
      name: "Pre-Seed",
      shareClass: "Series Seed",
      preMoneyRange: STAGE_CONFIG.preSeedPreMoney,
      sizeRange: STAGE_CONFIG.preSeedSize,
    });
    roundConfigs.push({
      name: "Seed",
      shareClass: "Series Seed",
      preMoneyRange: STAGE_CONFIG.seedPreMoney,
      sizeRange: STAGE_CONFIG.seedSize,
    });
  } else if (company.stage === "Series A") {
    roundConfigs.push({
      name: "Pre-Seed",
      shareClass: "Series Seed",
      preMoneyRange: STAGE_CONFIG.preSeedPreMoney,
      sizeRange: STAGE_CONFIG.preSeedSize,
    });
    roundConfigs.push({
      name: "Seed",
      shareClass: "Series Seed",
      preMoneyRange: STAGE_CONFIG.seedPreMoney,
      sizeRange: STAGE_CONFIG.seedSize,
    });
    roundConfigs.push({
      name: "Series A",
      shareClass: "Series A",
      preMoneyRange: STAGE_CONFIG.seriesAPreMoney,
      sizeRange: STAGE_CONFIG.seriesASize,
    });
  }

  // ── 5. Generate each round ─────────────────────────────────────────
  let founderOwnership = 100; // track dilution

  for (let ri = 0; ri < roundConfigs.length; ri++) {
    const rc = roundConfigs[ri];
    const t = seededRandom(sid + "round", ri);

    const preMoney = lerp(rc.preMoneyRange[0], rc.preMoneyRange[1], t);
    const roundSize = lerp(rc.sizeRange[0], rc.sizeRange[1], seededRandom(sid + "size", ri));
    const postMoney = preMoney + roundSize;
    const sharePrice = preMoney / totalShares;
    const newShares = Math.round(roundSize / sharePrice);

    // Determine investors for this round
    const roundInvestors: RoundInvestor[] = [];
    const roundShareholderIds: string[] = [];

    // Our fund always invests in the first round, sometimes follows on
    const ourParticipation = ri === 0 || seededRandom(sid + "followon", ri) > 0.5;
    let ourAmount = 0;
    if (ourParticipation) {
      // Our check: 15-35% of round for first round, 5-15% for follow-ons
      const ourPctOfRound = ri === 0
        ? 0.15 + seededRandom(sid + "ourpct", ri) * 0.20
        : 0.05 + seededRandom(sid + "ourpct", ri) * 0.10;
      ourAmount = Math.round(roundSize * ourPctOfRound);
      const ourShares = Math.round(ourAmount / sharePrice);
      roundInvestors.push({
        shareholderId: OUR_FUND_ID,
        amount: ourAmount,
        shares: ourShares,
      });
      roundShareholderIds.push(OUR_FUND_ID);
    }

    // Lead investor (external fund)
    let leadName: string;
    let leadFundId: string;
    if (rc.name === "Pre-Seed") {
      // Angels lead pre-seed
      leadName = pick(ANGEL_NAMES, sid + "lead", ri);
      leadFundId = `sh_angel_${sid}_${ri}`;
      shareholders.push({ id: leadFundId, name: leadName, type: "angel" });
    } else if (rc.name === "Seed") {
      leadName = pick(SEED_FUNDS, sid + "lead", ri);
      leadFundId = `sh_seedfund_${sid}_${ri}`;
      shareholders.push({ id: leadFundId, name: leadName, type: "fund" });
    } else {
      leadName = pick(SERIES_A_FUNDS, sid + "lead", ri);
      leadFundId = `sh_safund_${sid}_${ri}`;
      shareholders.push({ id: leadFundId, name: leadName, type: "fund" });
    }

    const leadAmount = Math.round((roundSize - ourAmount) * (0.5 + seededRandom(sid + "leadpct", ri) * 0.3));
    const leadShares = Math.round(leadAmount / sharePrice);
    roundInvestors.push({
      shareholderId: leadFundId,
      amount: leadAmount,
      shares: leadShares,
    });
    roundShareholderIds.push(leadFundId);

    // Other investors fill the rest
    const remaining = roundSize - ourAmount - leadAmount;
    if (remaining > 0) {
      const otherName = pick(
        rc.name === "Series A" ? SEED_FUNDS : ANGEL_NAMES,
        sid + "other",
        ri
      );
      const otherId = `sh_other_${sid}_${ri}`;
      shareholders.push({ id: otherId, name: otherName, type: rc.name === "Series A" ? "fund" : "angel" });
      const otherShares = Math.round(remaining / sharePrice);
      roundInvestors.push({
        shareholderId: otherId,
        amount: remaining,
        shares: otherShares,
      });
    }

    // Update total shares
    const actualNewShares = roundInvestors.reduce((sum, inv) => sum + inv.shares, 0);
    totalShares += actualNewShares;

    // Compute founder ownership after
    const founderShareTotal = holdings
      .filter((h) => h.shareClass === "Common")
      .reduce((sum, h) => sum + h.shares, 0);
    founderOwnership = (founderShareTotal / totalShares) * 100;

    // Add holdings for investors
    for (const inv of roundInvestors) {
      const existing = holdings.find(
        (h) => h.shareholderId === inv.shareholderId && h.shareClass === rc.shareClass
      );
      if (existing) {
        existing.shares += inv.shares;
        existing.investmentAmount += inv.amount;
      } else {
        holdings.push({
          shareholderId: inv.shareholderId,
          shareClass: rc.shareClass,
          shares: inv.shares,
          ownershipPct: 0,
          investmentAmount: inv.amount,
        });
      }
    }

    // Build round date from company founded date
    const founded = new Date(company.foundedDate);
    const roundDate = new Date(founded);
    roundDate.setMonth(roundDate.getMonth() + ri * 8 + Math.floor(seededRandom(sid + "rdate", ri) * 4));

    rounds.push({
      id: `round_${sid}_${ri}`,
      companyId: company.id,
      name: rc.name,
      date: roundDate.toISOString().slice(0, 10),
      preMoney,
      roundSize,
      postMoney,
      sharePrice,
      leadInvestor: leadName,
      investors: roundInvestors,
      founderOwnershipAfter: Math.round(founderOwnership * 100) / 100,
    });

    // Add liquidation preferences
    if (!liquidationPrefs.find((lp) => lp.shareClass === rc.shareClass)) {
      liquidationPrefs.push({
        shareClass: rc.shareClass,
        multiple: 1,
        participating: rc.name === "Series A" ? seededRandom(sid + "part", ri) > 0.6 : false,
        participationCap: rc.name === "Series A" && seededRandom(sid + "cap", ri) > 0.5 ? 3 : null,
      });
    }
  }

  // ── 6. Compute final ownership percentages ─────────────────────────
  for (const h of holdings) {
    h.ownershipPct = Math.round((h.shares / totalShares) * 10000) / 100;
  }

  return {
    companyId: company.id,
    shareholders,
    holdings,
    rounds,
    liquidationPrefs,
    totalShares,
  };
}

// ─── Pre-compute all cap tables ──────────────────────────────────────────

const allCapTables: Map<string, CapTableEntry> = new Map();
for (const company of companies) {
  allCapTables.set(company.id, generateCapTable(company));
}

// ─── Portfolio positions ─────────────────────────────────────────────────

function computePosition(company: Company, capTable: CapTableEntry): PortfolioPosition {
  // Our holdings
  const ourHoldings = capTable.holdings.filter((h) => h.shareholderId === OUR_FUND_ID);
  const checkSize = ourHoldings.reduce((sum, h) => sum + h.investmentAmount, 0);
  const ownershipPct = ourHoldings.reduce((sum, h) => sum + h.ownershipPct, 0);

  // Implied valuation from latest MRR (use revenue multiple based on stage)
  const snapshots = getSnapshots(company.id);
  const latestMrr = snapshots.length > 0
    ? snapshots.sort((a, b) => b.month.localeCompare(a.month))[0].mrr
    : 0;
  const arr = latestMrr * 12;

  // Revenue multiple heuristic by stage
  const multiples: Record<string, number> = {
    "Pre-Seed": 40,
    "Seed": 30,
    "Series A": 20,
  };
  const multiple = multiples[company.stage] ?? 25;
  const impliedValuation = arr * multiple;

  const unrealizedValue = impliedValuation * (ownershipPct / 100);
  const moic = checkSize > 0 ? unrealizedValue / checkSize : 0;

  const lastRound = capTable.rounds.length > 0
    ? capTable.rounds[capTable.rounds.length - 1].name
    : "N/A";

  return {
    companyId: company.id,
    companyName: company.name,
    stage: company.stage,
    lastRound,
    checkSize,
    ownershipPct: Math.round(ownershipPct * 100) / 100,
    impliedValuation,
    moic: Math.round(moic * 100) / 100,
    unrealizedValue: Math.round(unrealizedValue),
    logoColor: company.logoColor,
  };
}

const allPositions: PortfolioPosition[] = companies.map((c) => {
  const capTable = allCapTables.get(c.id)!;
  return computePosition(c, capTable);
});

// ─── Public API ──────────────────────────────────────────────────────────

export function getCapTable(companyId: string): CapTableEntry | undefined {
  return allCapTables.get(companyId);
}

export function getAllCapTables(): Map<string, CapTableEntry> {
  return allCapTables;
}

export function getPortfolioPositions(): PortfolioPosition[] {
  return allPositions;
}

export function getPortfolioPosition(companyId: string): PortfolioPosition | undefined {
  return allPositions.find((p) => p.companyId === companyId);
}

export { OUR_FUND, OUR_FUND_ID };
