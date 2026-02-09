// ─── Cap Table Types ─────────────────────────────────────────────────────

export type ShareClassName = "Common" | "Series Seed" | "Series A" | "Option Pool";

export type ShareholderType = "founder" | "fund" | "angel" | "employee" | "option-pool";

export interface Shareholder {
  id: string;
  name: string;
  type: ShareholderType;
}

export interface Holding {
  shareholderId: string;
  shareClass: ShareClassName;
  shares: number;
  ownershipPct: number; // 0-100
  investmentAmount: number; // $0 for founders/options
}

export interface LiquidationPref {
  shareClass: ShareClassName;
  multiple: number; // e.g. 1 = 1x
  participating: boolean;
  participationCap: number | null; // null = uncapped, number = cap multiple (e.g. 3 means 3x cap)
}

export interface RoundInvestor {
  shareholderId: string;
  amount: number;
  shares: number;
}

export interface FundingRound {
  id: string;
  companyId: string;
  name: string; // "Pre-Seed", "Seed", "Series A"
  date: string; // ISO date
  preMoney: number;
  roundSize: number;
  postMoney: number;
  sharePrice: number;
  leadInvestor: string; // shareholder name
  investors: RoundInvestor[];
  founderOwnershipAfter: number; // % after this round
}

export interface CapTableEntry {
  companyId: string;
  shareholders: Shareholder[];
  holdings: Holding[];
  rounds: FundingRound[];
  liquidationPrefs: LiquidationPref[];
  totalShares: number;
}

export interface PortfolioPosition {
  companyId: string;
  companyName: string;
  stage: string;
  lastRound: string;
  checkSize: number; // our total invested
  ownershipPct: number; // our current %
  impliedValuation: number;
  moic: number;
  unrealizedValue: number;
  logoColor: string;
}

// ─── Round Modeler Types ─────────────────────────────────────────────────

export interface RoundModelParams {
  name: string;
  preMoney: number;
  roundSize: number;
  ourAllocation: number; // $ amount we invest in this round
}

export interface DilutionPreview {
  shareholderId: string;
  shareholderName: string;
  beforePct: number;
  afterPct: number;
  dilution: number; // absolute pct points lost
}

// ─── Waterfall Types ─────────────────────────────────────────────────────

export interface WaterfallRow {
  shareClass: ShareClassName;
  investedAmount: number;
  liquidationPayout: number;
  participationPayout: number;
  commonPayout: number;
  totalProceeds: number;
  moic: number;
}

export interface WaterfallResult {
  rows: WaterfallRow[];
  fundProceeds: number;
  fundMoic: number;
  fundIrr: number | null;
  exitValuation: number;
}

export interface SensitivityPoint {
  exitValuation: number;
  [key: string]: number; // shareClass => proceeds
}
