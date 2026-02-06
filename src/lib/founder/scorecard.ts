import type {
  FounderMonthlyMetrics,
  HealthScoreBreakdown,
  FundraisingReadiness,
  FundraisingSignal,
  ActionItem,
} from "./types";
import { momGrowthRates, avgRecentGrowth } from "./trajectory";

// ─── Health Score ────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function scoreGrowth(snapshots: FounderMonthlyMetrics[]): number {
  const avg = avgRecentGrowth(snapshots, 3);
  // 0% → 0, 5% → 40, 10% → 65, 15% → 80, 25%+ → 100
  return clamp(Math.round((avg / 25) * 100), 0, 100);
}

function scoreRunway(latest: FounderMonthlyMetrics): number {
  const r = latest.runway;
  if (r >= 18) return 100;
  if (r >= 12) return 80;
  if (r >= 9) return 60;
  if (r >= 6) return 35;
  return Math.round((r / 6) * 35);
}

function scoreChurn(latest: FounderMonthlyMetrics): number {
  const c = latest.churnRate;
  if (c <= 1) return 100;
  if (c <= 2) return 85;
  if (c <= 3) return 70;
  if (c <= 5) return 50;
  if (c <= 8) return 25;
  return 10;
}

function scoreLtvCac(latest: FounderMonthlyMetrics): number {
  const ratio = latest.cac > 0 ? latest.ltv / latest.cac : 0;
  if (ratio >= 5) return 100;
  if (ratio >= 3) return 80;
  if (ratio >= 2) return 60;
  if (ratio >= 1) return 35;
  return Math.round(ratio * 35);
}

function scoreNps(latest: FounderMonthlyMetrics): number {
  const n = latest.nps;
  if (n >= 70) return 100;
  if (n >= 50) return 80;
  if (n >= 30) return 60;
  if (n >= 0) return 40;
  return 20;
}

function scoreBurnEfficiency(latest: FounderMonthlyMetrics): number {
  if (latest.burn === 0) return 100;
  const ratio = latest.mrr / latest.burn;
  if (ratio >= 1) return 100;
  if (ratio >= 0.7) return 85;
  if (ratio >= 0.5) return 70;
  if (ratio >= 0.3) return 50;
  if (ratio >= 0.15) return 30;
  return 15;
}

/**
 * Calculate composite health score (0-100) with sub-scores.
 * Weights: growth 30%, runway 20%, churn 15%, LTV:CAC 15%, NPS 10%, burn efficiency 10%
 */
export function calcHealthScore(
  snapshots: FounderMonthlyMetrics[]
): HealthScoreBreakdown {
  if (snapshots.length === 0) {
    return { overall: 0, growth: 0, runway: 0, churn: 0, ltvCac: 0, nps: 0, burnEfficiency: 0 };
  }

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];

  const growth = scoreGrowth(snapshots);
  const runway = scoreRunway(latest);
  const churn = scoreChurn(latest);
  const ltvCac = scoreLtvCac(latest);
  const nps = scoreNps(latest);
  const burnEfficiency = scoreBurnEfficiency(latest);

  const overall = Math.round(
    growth * 0.3 +
      runway * 0.2 +
      churn * 0.15 +
      ltvCac * 0.15 +
      nps * 0.1 +
      burnEfficiency * 0.1
  );

  return { overall, growth, runway, churn, ltvCac, nps, burnEfficiency };
}

// ─── Fundraising Readiness ──────────────────────────────────────────────

/**
 * Evaluate fundraising readiness against typical Series A benchmarks.
 */
export function calcFundraisingReadiness(
  snapshots: FounderMonthlyMetrics[]
): FundraisingReadiness {
  if (snapshots.length === 0) {
    return { score: 0, label: "Not Yet", signals: [] };
  }

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const avgGrowth = avgRecentGrowth(snapshots, 3);
  const ltvCac = latest.cac > 0 ? latest.ltv / latest.cac : 0;

  const signals: FundraisingSignal[] = [
    {
      label: "MRR > $100K",
      met: latest.mrr >= 100000,
      current: `$${(latest.mrr / 1000).toFixed(0)}K`,
      target: "$100K",
    },
    {
      label: "MoM Growth > 15%",
      met: avgGrowth >= 15,
      current: `${avgGrowth.toFixed(1)}%`,
      target: "15%",
    },
    {
      label: "Churn < 5%",
      met: latest.churnRate < 5,
      current: `${latest.churnRate.toFixed(1)}%`,
      target: "< 5%",
    },
    {
      label: "LTV:CAC > 3x",
      met: ltvCac >= 3,
      current: `${ltvCac.toFixed(1)}x`,
      target: "3x",
    },
    {
      label: "Runway > 12 months",
      met: latest.runway >= 12,
      current: `${latest.runway.toFixed(0)}mo`,
      target: "12 mo",
    },
    {
      label: "NPS > 50",
      met: latest.nps >= 50,
      current: `${latest.nps}`,
      target: "50",
    },
  ];

  const metCount = signals.filter((s) => s.met).length;
  const score = Math.round((metCount / signals.length) * 100);

  let label: FundraisingReadiness["label"];
  if (score >= 80) label = "Ready";
  else if (score >= 50) label = "Getting There";
  else label = "Not Yet";

  return { score, label, signals };
}

// ─── Action Items ───────────────────────────────────────────────────────

/**
 * Generate prioritized action items based on weakest metrics.
 */
export function generateActionItems(
  snapshots: FounderMonthlyMetrics[]
): ActionItem[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const avgGrowth = avgRecentGrowth(snapshots, 3);
  const ltvCac = latest.cac > 0 ? latest.ltv / latest.cac : 0;
  const rates = momGrowthRates(snapshots);

  const items: ActionItem[] = [];

  // Runway concerns
  if (latest.runway < 6) {
    items.push({
      priority: "high",
      title: "Extend runway urgently",
      description:
        "Current runway is critically low. Consider cutting burn, accelerating revenue, or starting fundraise conversations immediately.",
      metric: "runway",
    });
  } else if (latest.runway < 9) {
    items.push({
      priority: "medium",
      title: "Plan runway extension",
      description:
        "Runway is under 9 months. Begin fundraising preparation or identify cost optimization opportunities.",
      metric: "runway",
    });
  }

  // Growth concerns
  if (avgGrowth < 5) {
    items.push({
      priority: "high",
      title: "Reignite growth",
      description:
        "Growth has stalled below 5% MoM. Investigate product-market fit, review acquisition channels, and consider pivoting pricing strategy.",
      metric: "growth",
    });
  } else if (rates.length >= 2 && rates[rates.length - 1].growth < rates[rates.length - 2].growth - 3) {
    items.push({
      priority: "medium",
      title: "Address growth deceleration",
      description:
        "Growth rate is declining. Analyze churned customers for patterns and double down on your best acquisition channel.",
      metric: "growth",
    });
  }

  // Churn concerns
  if (latest.churnRate >= 8) {
    items.push({
      priority: "high",
      title: "Reduce customer churn",
      description:
        "Churn is critically high. Implement customer success playbook, conduct exit interviews, and identify sticky features.",
      metric: "churn",
    });
  } else if (latest.churnRate >= 5) {
    items.push({
      priority: "medium",
      title: "Improve retention",
      description:
        "Churn rate is above the 5% threshold. Analyze common drop-off points and invest in onboarding improvements.",
      metric: "churn",
    });
  }

  // Unit economics
  if (ltvCac < 1.5) {
    items.push({
      priority: "high",
      title: "Fix unit economics",
      description:
        "LTV:CAC ratio is unsustainable. Reduce acquisition cost or increase customer lifetime value through upsells and retention.",
      metric: "ltvCac",
    });
  } else if (ltvCac < 3) {
    items.push({
      priority: "medium",
      title: "Improve unit economics",
      description:
        "LTV:CAC ratio is below the 3x target. Focus on reducing CAC through organic channels or increasing LTV via pricing.",
      metric: "ltvCac",
    });
  }

  // Burn efficiency
  if (latest.burn > 0 && latest.mrr / latest.burn < 0.3) {
    items.push({
      priority: "medium",
      title: "Optimize burn efficiency",
      description:
        "Revenue-to-burn ratio is low. Review headcount plan and non-essential spend to improve capital efficiency.",
      metric: "burn",
    });
  }

  // NPS
  if (latest.nps < 30) {
    items.push({
      priority: "medium",
      title: "Boost product satisfaction",
      description:
        "NPS is below 30, indicating customer dissatisfaction. Conduct user interviews and prioritize top pain points.",
      metric: "nps",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return items.slice(0, 5); // Top 5 action items
}
