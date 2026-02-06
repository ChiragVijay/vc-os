import type { Sector, BatchId, Stage } from "../dashboard/types";

export interface FounderCompany {
  name: string;
  sector: Sector;
  batch: BatchId;
  stage: Stage;
  foundedDate: string; // ISO date
  teamSize: number;
  description: string;
}

export interface FounderMonthlyMetrics {
  month: string; // YYYY-MM
  mrr: number;
  burn: number;
  runway: number; // months
  customers: number;
  churnRate: number; // percentage
  ltv: number;
  cac: number;
  nps: number;
}

export interface FounderProfile {
  company: FounderCompany;
  snapshots: FounderMonthlyMetrics[];
  isDemo: boolean;
  savedAt: string; // ISO date
}

export interface FounderBenchmarkResult {
  metric: string;
  label: string;
  value: number;
  percentile: number;
  quartile: 1 | 2 | 3 | 4;
  cohortMedian: number;
  cohortP25: number;
  cohortP75: number;
  unit: string;
  higherIsBetter: boolean;
}

export interface HealthScoreBreakdown {
  overall: number; // 0-100
  growth: number;
  runway: number;
  churn: number;
  ltvCac: number;
  nps: number;
  burnEfficiency: number;
}

export interface FundraisingSignal {
  label: string;
  met: boolean;
  current: string;
  target: string;
}

export interface FundraisingReadiness {
  score: number; // 0-100
  label: "Ready" | "Getting There" | "Not Yet";
  signals: FundraisingSignal[];
}

export interface ActionItem {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  metric: string;
}

export interface ScenarioProjection {
  label: string;
  growthRate: number;
  projectedMrr6mo: number;
  projectedMrr12mo: number;
  projectedArr12mo: number;
}
