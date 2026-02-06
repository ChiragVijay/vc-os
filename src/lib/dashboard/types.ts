export type Sector = "SaaS" | "Fintech" | "Health" | "Dev Tools" | "Marketplace" | "AI/ML";
export type Stage = "Pre-Seed" | "Seed" | "Series A";
export type BatchId = "W25" | "S25" | "W26" | "S26";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "runway-critical"
  | "runway-warning"
  | "growth-stall"
  | "growth-collapse"
  | "burn-spike"
  | "churn-high"
  | "ltv-cac-unhealthy";
export type GrowthTrend = "accelerating" | "stable" | "decelerating";
export type MentionTrend = "growing" | "stable" | "declining" | "unknown";

export interface Company {
  id: string;
  name: string;
  sector: Sector;
  batch: BatchId;
  stage: Stage;
  foundedDate: string; // ISO date
  teamSize: number;
  description: string;
  logoColor: string; // hex color for avatar placeholder
}

export interface MonthlySnapshot {
  companyId: string;
  month: string; // YYYY-MM
  mrr: number;
  burn: number;
  runway: number; // months
  customers: number;
  churnRate: number; // percentage (e.g., 3.2 = 3.2%)
  ltv: number;
  cac: number;
  nps: number;
}

export interface Alert {
  id: string;
  companyId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  detectedAt: string; // ISO date
}

export interface BatchSummary {
  batch: BatchId;
  companyCount: number;
  totalArr: number;
  avgMomGrowth: number;
  medianRunway: number;
  topQuartileGrowth: number;
}

export interface BenchmarkResult {
  metric: string;
  label: string;
  value: number;
  percentile: number;
  quartile: 1 | 2 | 3 | 4;
  cohortMedian: number;
  cohortP25: number;
  cohortP75: number;
  unit: string;
}

export interface DashboardFilters {
  batch: BatchId | "all";
  sector: Sector | "all";
  stage: Stage | "all";
  search: string;
}
