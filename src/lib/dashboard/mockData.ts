import type { Company, MonthlySnapshot, BatchId, Sector, Stage } from "./types";

// ─── Companies ──────────────────────────────────────────────────────────

export const companies: Company[] = [
  // ── W25 Batch (8 companies) ───────────────────
  {
    id: "co_001",
    name: "Luminary AI",
    sector: "AI/ML",
    batch: "W25",
    stage: "Seed",
    foundedDate: "2024-06-15",
    teamSize: 8,
    description: "AI-powered contract analysis for legal teams.",
    logoColor: "#6366f1",
  },
  {
    id: "co_002",
    name: "PayGrid",
    sector: "Fintech",
    batch: "W25",
    stage: "Seed",
    foundedDate: "2024-03-01",
    teamSize: 12,
    description: "Embedded payroll infrastructure for vertical SaaS.",
    logoColor: "#10b981",
  },
  {
    id: "co_003",
    name: "Medlogix",
    sector: "Health",
    batch: "W25",
    stage: "Pre-Seed",
    foundedDate: "2024-08-10",
    teamSize: 5,
    description: "Clinical trial matching platform for rare diseases.",
    logoColor: "#ec4899",
  },
  {
    id: "co_004",
    name: "TermStack",
    sector: "Dev Tools",
    batch: "W25",
    stage: "Seed",
    foundedDate: "2024-01-20",
    teamSize: 6,
    description: "Collaborative terminal multiplexer with AI autocomplete.",
    logoColor: "#8b5cf6",
  },
  {
    id: "co_005",
    name: "CartLoop",
    sector: "Marketplace",
    batch: "W25",
    stage: "Pre-Seed",
    foundedDate: "2024-07-05",
    teamSize: 4,
    description: "Circular commerce marketplace for refurbished electronics.",
    logoColor: "#f59e0b",
  },
  {
    id: "co_006",
    name: "Neurovault",
    sector: "AI/ML",
    batch: "W25",
    stage: "Seed",
    foundedDate: "2024-04-12",
    teamSize: 10,
    description: "Vector database optimized for multi-modal embeddings.",
    logoColor: "#3b82f6",
  },
  {
    id: "co_007",
    name: "FinLens",
    sector: "Fintech",
    batch: "W25",
    stage: "Series A",
    foundedDate: "2023-09-01",
    teamSize: 22,
    description: "Real-time treasury management for mid-market companies.",
    logoColor: "#14b8a6",
  },
  {
    id: "co_008",
    name: "DocuHealth",
    sector: "Health",
    batch: "W25",
    stage: "Seed",
    foundedDate: "2024-02-15",
    teamSize: 9,
    description: "Automated medical documentation using ambient AI.",
    logoColor: "#f43f5e",
  },

  // ── S25 Batch (7 companies) ───────────────────
  {
    id: "co_009",
    name: "Replit Clone",
    sector: "Dev Tools",
    batch: "S25",
    stage: "Seed",
    foundedDate: "2024-10-01",
    teamSize: 7,
    description: "Browser-based IDE with built-in deployment pipeline.",
    logoColor: "#a855f7",
  },
  {
    id: "co_010",
    name: "SwiftPay",
    sector: "Fintech",
    batch: "S25",
    stage: "Pre-Seed",
    foundedDate: "2025-01-15",
    teamSize: 4,
    description: "Instant cross-border payments for freelancers.",
    logoColor: "#22c55e",
  },
  {
    id: "co_011",
    name: "DataMesh",
    sector: "SaaS",
    batch: "S25",
    stage: "Seed",
    foundedDate: "2024-11-20",
    teamSize: 11,
    description: "Data catalog and lineage tracking for modern data stacks.",
    logoColor: "#0ea5e9",
  },
  {
    id: "co_012",
    name: "GreenRoute",
    sector: "Marketplace",
    batch: "S25",
    stage: "Pre-Seed",
    foundedDate: "2025-02-01",
    teamSize: 3,
    description: "Carbon-optimized logistics marketplace for SMBs.",
    logoColor: "#84cc16",
  },
  {
    id: "co_013",
    name: "Synthia",
    sector: "AI/ML",
    batch: "S25",
    stage: "Seed",
    foundedDate: "2024-09-10",
    teamSize: 8,
    description: "Synthetic data generation for enterprise ML pipelines.",
    logoColor: "#e879f9",
  },
  {
    id: "co_014",
    name: "VitalSign",
    sector: "Health",
    batch: "S25",
    stage: "Seed",
    foundedDate: "2024-12-01",
    teamSize: 14,
    description: "Remote patient monitoring with predictive alerts.",
    logoColor: "#ef4444",
  },
  {
    id: "co_015",
    name: "CloudLedger",
    sector: "SaaS",
    batch: "S25",
    stage: "Series A",
    foundedDate: "2024-05-15",
    teamSize: 25,
    description: "Automated accounting reconciliation for e-commerce.",
    logoColor: "#06b6d4",
  },

  // ── W26 Batch (8 companies) ───────────────────
  {
    id: "co_016",
    name: "PromptForge",
    sector: "AI/ML",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-06-01",
    teamSize: 3,
    description: "Prompt engineering platform with version control.",
    logoColor: "#f97316",
  },
  {
    id: "co_017",
    name: "TrustLayer",
    sector: "Fintech",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-07-20",
    teamSize: 5,
    description: "Automated vendor risk scoring for procurement teams.",
    logoColor: "#059669",
  },
  {
    id: "co_018",
    name: "CodeReview.ai",
    sector: "Dev Tools",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-08-10",
    teamSize: 4,
    description: "AI code reviewer that learns team conventions.",
    logoColor: "#7c3aed",
  },
  {
    id: "co_019",
    name: "NutriScan",
    sector: "Health",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-09-01",
    teamSize: 3,
    description: "Computer vision nutrition tracking from food photos.",
    logoColor: "#fb923c",
  },
  {
    id: "co_020",
    name: "SupplyMesh",
    sector: "Marketplace",
    batch: "W26",
    stage: "Seed",
    foundedDate: "2025-05-15",
    teamSize: 9,
    description: "B2B marketplace connecting manufacturers with distributors.",
    logoColor: "#64748b",
  },
  {
    id: "co_021",
    name: "FlowDesk",
    sector: "SaaS",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-10-01",
    teamSize: 4,
    description: "Workflow automation for professional services firms.",
    logoColor: "#2563eb",
  },
  {
    id: "co_022",
    name: "AgentKit",
    sector: "AI/ML",
    batch: "W26",
    stage: "Seed",
    foundedDate: "2025-06-20",
    teamSize: 7,
    description: "Framework for building autonomous AI agent swarms.",
    logoColor: "#dc2626",
  },
  {
    id: "co_023",
    name: "PeerLend",
    sector: "Fintech",
    batch: "W26",
    stage: "Pre-Seed",
    foundedDate: "2025-08-01",
    teamSize: 5,
    description: "Peer-to-peer lending for small business working capital.",
    logoColor: "#0d9488",
  },

  // ── S26 Batch (7 companies) ───────────────────
  {
    id: "co_024",
    name: "SpecLab",
    sector: "Dev Tools",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2025-12-15",
    teamSize: 3,
    description: "Auto-generate API specs from codebase analysis.",
    logoColor: "#4f46e5",
  },
  {
    id: "co_025",
    name: "CareBot",
    sector: "Health",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2025-11-01",
    teamSize: 4,
    description: "AI-powered patient triage for urgent care clinics.",
    logoColor: "#e11d48",
  },
  {
    id: "co_026",
    name: "Vendora",
    sector: "Marketplace",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2026-01-10",
    teamSize: 3,
    description: "Niche marketplace for handmade sustainable home goods.",
    logoColor: "#ca8a04",
  },
  {
    id: "co_027",
    name: "ModelShip",
    sector: "AI/ML",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2025-12-01",
    teamSize: 5,
    description: "One-click model deployment with auto-scaling inference.",
    logoColor: "#9333ea",
  },
  {
    id: "co_028",
    name: "LedgerSync",
    sector: "Fintech",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2026-01-05",
    teamSize: 4,
    description: "Real-time bank reconciliation for startups.",
    logoColor: "#16a34a",
  },
  {
    id: "co_029",
    name: "MetricFlow",
    sector: "SaaS",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2025-11-15",
    teamSize: 3,
    description: "Product analytics with built-in experimentation engine.",
    logoColor: "#0284c7",
  },
  {
    id: "co_030",
    name: "HireWire",
    sector: "SaaS",
    batch: "S26",
    stage: "Pre-Seed",
    foundedDate: "2026-01-20",
    teamSize: 4,
    description: "AI hiring assistant with structured interview scorecards.",
    logoColor: "#d946ef",
  },
];

// ─── Snapshot Generation ────────────────────────────────────────────────

type GrowthProfile = {
  startMrr: number;
  monthlyGrowthBase: number; // e.g., 0.15 = 15% MoM
  volatility: number; // random jitter
  burnBase: number;
  startCustomers: number;
  baseChurn: number;
  baseLtv: number;
  baseCac: number;
  baseNps: number;
};

const profiles: Record<string, GrowthProfile> = {
  // ── Rocketships ──
  co_001: { startMrr: 18000, monthlyGrowthBase: 0.22, volatility: 0.04, burnBase: 65000, startCustomers: 12, baseChurn: 1.8, baseLtv: 24000, baseCac: 4500, baseNps: 72 },
  co_002: { startMrr: 45000, monthlyGrowthBase: 0.18, volatility: 0.03, burnBase: 95000, startCustomers: 35, baseChurn: 2.1, baseLtv: 18000, baseCac: 3200, baseNps: 65 },
  co_007: { startMrr: 120000, monthlyGrowthBase: 0.12, volatility: 0.02, burnBase: 180000, startCustomers: 85, baseChurn: 1.5, baseLtv: 36000, baseCac: 8000, baseNps: 71 },
  co_011: { startMrr: 32000, monthlyGrowthBase: 0.20, volatility: 0.05, burnBase: 72000, startCustomers: 28, baseChurn: 2.5, baseLtv: 15000, baseCac: 3800, baseNps: 68 },
  co_015: { startMrr: 95000, monthlyGrowthBase: 0.14, volatility: 0.02, burnBase: 160000, startCustomers: 120, baseChurn: 1.2, baseLtv: 22000, baseCac: 5500, baseNps: 74 },
  co_022: { startMrr: 22000, monthlyGrowthBase: 0.25, volatility: 0.06, burnBase: 55000, startCustomers: 15, baseChurn: 2.0, baseLtv: 20000, baseCac: 4000, baseNps: 70 },

  // ── Steady Growers ──
  co_004: { startMrr: 15000, monthlyGrowthBase: 0.10, volatility: 0.03, burnBase: 40000, startCustomers: 45, baseChurn: 3.0, baseLtv: 8000, baseCac: 2200, baseNps: 62 },
  co_006: { startMrr: 38000, monthlyGrowthBase: 0.08, volatility: 0.02, burnBase: 85000, startCustomers: 22, baseChurn: 2.8, baseLtv: 28000, baseCac: 6500, baseNps: 58 },
  co_008: { startMrr: 28000, monthlyGrowthBase: 0.12, volatility: 0.04, burnBase: 70000, startCustomers: 18, baseChurn: 2.2, baseLtv: 30000, baseCac: 7000, baseNps: 66 },
  co_009: { startMrr: 12000, monthlyGrowthBase: 0.11, volatility: 0.03, burnBase: 48000, startCustomers: 80, baseChurn: 4.5, baseLtv: 3600, baseCac: 800, baseNps: 55 },
  co_013: { startMrr: 25000, monthlyGrowthBase: 0.13, volatility: 0.04, burnBase: 60000, startCustomers: 20, baseChurn: 2.0, baseLtv: 16000, baseCac: 3500, baseNps: 64 },
  co_014: { startMrr: 35000, monthlyGrowthBase: 0.09, volatility: 0.02, burnBase: 90000, startCustomers: 40, baseChurn: 1.8, baseLtv: 25000, baseCac: 6000, baseNps: 69 },
  co_020: { startMrr: 20000, monthlyGrowthBase: 0.10, volatility: 0.03, burnBase: 50000, startCustomers: 30, baseChurn: 3.5, baseLtv: 12000, baseCac: 2800, baseNps: 60 },

  // ── Plateaus / Struggling ──
  co_003: { startMrr: 8000, monthlyGrowthBase: 0.04, volatility: 0.06, burnBase: 55000, startCustomers: 6, baseChurn: 5.5, baseLtv: 20000, baseCac: 12000, baseNps: 45 },
  co_005: { startMrr: 5000, monthlyGrowthBase: 0.03, volatility: 0.08, burnBase: 35000, startCustomers: 150, baseChurn: 8.0, baseLtv: 800, baseCac: 350, baseNps: 40 },
  co_010: { startMrr: 3000, monthlyGrowthBase: 0.06, volatility: 0.07, burnBase: 28000, startCustomers: 200, baseChurn: 6.0, baseLtv: 600, baseCac: 200, baseNps: 42 },
  co_012: { startMrr: 2000, monthlyGrowthBase: 0.02, volatility: 0.09, burnBase: 30000, startCustomers: 50, baseChurn: 7.5, baseLtv: 1500, baseCac: 800, baseNps: 38 },

  // ── Early / New (W26 & S26 — fewer months) ──
  co_016: { startMrr: 4000, monthlyGrowthBase: 0.30, volatility: 0.10, burnBase: 22000, startCustomers: 8, baseChurn: 3.0, baseLtv: 10000, baseCac: 2500, baseNps: 60 },
  co_017: { startMrr: 6000, monthlyGrowthBase: 0.15, volatility: 0.05, burnBase: 30000, startCustomers: 15, baseChurn: 2.5, baseLtv: 12000, baseCac: 3000, baseNps: 55 },
  co_018: { startMrr: 3000, monthlyGrowthBase: 0.20, volatility: 0.08, burnBase: 25000, startCustomers: 40, baseChurn: 4.0, baseLtv: 4000, baseCac: 900, baseNps: 58 },
  co_019: { startMrr: 1500, monthlyGrowthBase: 0.05, volatility: 0.10, burnBase: 20000, startCustomers: 300, baseChurn: 9.0, baseLtv: 400, baseCac: 150, baseNps: 35 },
  co_021: { startMrr: 5000, monthlyGrowthBase: 0.12, volatility: 0.04, burnBase: 28000, startCustomers: 12, baseChurn: 3.5, baseLtv: 8000, baseCac: 2000, baseNps: 52 },
  co_023: { startMrr: 7000, monthlyGrowthBase: 0.08, volatility: 0.06, burnBase: 35000, startCustomers: 25, baseChurn: 4.5, baseLtv: 5000, baseCac: 1500, baseNps: 48 },
  co_024: { startMrr: 2000, monthlyGrowthBase: 0.18, volatility: 0.08, burnBase: 18000, startCustomers: 20, baseChurn: 5.0, baseLtv: 3000, baseCac: 700, baseNps: 50 },
  co_025: { startMrr: 3500, monthlyGrowthBase: 0.10, volatility: 0.06, burnBase: 22000, startCustomers: 10, baseChurn: 3.0, baseLtv: 15000, baseCac: 4000, baseNps: 56 },
  co_026: { startMrr: 1000, monthlyGrowthBase: 0.04, volatility: 0.12, burnBase: 15000, startCustomers: 100, baseChurn: 10.0, baseLtv: 500, baseCac: 200, baseNps: 32 },
  co_027: { startMrr: 5000, monthlyGrowthBase: 0.22, volatility: 0.07, burnBase: 30000, startCustomers: 10, baseChurn: 2.5, baseLtv: 12000, baseCac: 2800, baseNps: 63 },
  co_028: { startMrr: 2500, monthlyGrowthBase: 0.14, volatility: 0.06, burnBase: 20000, startCustomers: 18, baseChurn: 3.5, baseLtv: 6000, baseCac: 1200, baseNps: 50 },
  co_029: { startMrr: 3000, monthlyGrowthBase: 0.16, volatility: 0.05, burnBase: 22000, startCustomers: 15, baseChurn: 4.0, baseLtv: 5000, baseCac: 1100, baseNps: 54 },
  co_030: { startMrr: 1500, monthlyGrowthBase: 0.08, volatility: 0.09, burnBase: 18000, startCustomers: 5, baseChurn: 6.0, baseLtv: 8000, baseCac: 3000, baseNps: 44 },
};

// Deterministic seeded "random" using company ID hash
function seededRandom(seed: string, index: number): number {
  let h = 0;
  const s = seed + index.toString();
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return ((h & 0x7fffffff) % 1000) / 1000;
}

const batchStartMonths: Record<BatchId, string> = {
  W25: "2025-01",
  S25: "2025-06",
  W26: "2025-10",
  S26: "2026-01",
};

function getMonthCount(batch: BatchId): number {
  // Current date is Feb 2026 — count months from batch start to now
  const start = batchStartMonths[batch];
  const [sy, sm] = start.split("-").map(Number);
  const ey = 2026;
  const em = 2; // Feb 2026
  return Math.max(1, (ey - sy) * 12 + (em - sm));
}

function generateSnapshots(company: Company): MonthlySnapshot[] {
  const profile = profiles[company.id];
  if (!profile) return [];

  const monthCount = getMonthCount(company.batch);
  const startMonth = batchStartMonths[company.batch];
  const [startYear, startMon] = startMonth.split("-").map(Number);

  const snapshots: MonthlySnapshot[] = [];
  let mrr = profile.startMrr;
  let customers = profile.startCustomers;

  for (let i = 0; i < monthCount; i++) {
    const year = startYear + Math.floor((startMon - 1 + i) / 12);
    const month = ((startMon - 1 + i) % 12) + 1;
    const monthStr = `${year}-${month.toString().padStart(2, "0")}`;

    const rand = seededRandom(company.id, i);
    const growthJitter = (rand - 0.5) * 2 * profile.volatility;
    const growthRate = Math.max(-0.05, profile.monthlyGrowthBase + growthJitter);

    if (i > 0) {
      mrr = Math.round(mrr * (1 + growthRate));
      customers = Math.max(1, Math.round(customers * (1 + growthRate * 0.6)));
    }

    const burnJitter = 1 + (seededRandom(company.id + "burn", i) - 0.5) * 0.1;
    const burn = Math.round(profile.burnBase * burnJitter * (1 + i * 0.02));
    const runway = burn > mrr ? Math.round(((mrr * 6) / (burn - mrr * 0.3)) * 10) / 10 : 36;

    const churnJitter = (seededRandom(company.id + "churn", i) - 0.5) * 1.5;
    const churnRate = Math.max(0, Math.round((profile.baseChurn + churnJitter) * 10) / 10);

    const ltvJitter = 1 + (seededRandom(company.id + "ltv", i) - 0.5) * 0.2;
    const ltv = Math.round(profile.baseLtv * ltvJitter);

    const cacJitter = 1 + (seededRandom(company.id + "cac", i) - 0.5) * 0.15;
    const cac = Math.round(profile.baseCac * cacJitter);

    const npsJitter = (seededRandom(company.id + "nps", i) - 0.5) * 10;
    const nps = Math.round(Math.max(-100, Math.min(100, profile.baseNps + npsJitter)));

    snapshots.push({
      companyId: company.id,
      month: monthStr,
      mrr,
      burn,
      runway: Math.min(36, Math.max(0, runway)),
      customers,
      churnRate,
      ltv,
      cac,
      nps,
    });
  }

  return snapshots;
}

// ─── Pre-compute all snapshots ──────────────────────────────────────────

const allSnapshots: MonthlySnapshot[] = companies.flatMap(generateSnapshots);

// ─── Public API ─────────────────────────────────────────────────────────

export function getCompanies(): Company[] {
  return companies;
}

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getSnapshots(companyId: string): MonthlySnapshot[] {
  return allSnapshots.filter((s) => s.companyId === companyId);
}

export function getAllSnapshots(): MonthlySnapshot[] {
  return allSnapshots;
}

export function getBatches(): BatchId[] {
  return ["W25", "S25", "W26", "S26"];
}

export function getSectors(): Sector[] {
  return ["SaaS", "Fintech", "Health", "Dev Tools", "Marketplace", "AI/ML"];
}

export function getStages(): Stage[] {
  return ["Pre-Seed", "Seed", "Series A"];
}
