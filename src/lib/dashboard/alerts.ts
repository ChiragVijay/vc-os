import type { Alert, MonthlySnapshot } from "./types";
import { calcMrrGrowth, calcLtvCacRatio } from "./metrics";

let alertCounter = 0;
function nextAlertId(): string {
  return `alert_${(++alertCounter).toString().padStart(3, "0")}`;
}

export function generateAlerts(
  companyId: string,
  snapshots: MonthlySnapshot[]
): Alert[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const alerts: Alert[] = [];
  const now = latest.month;

  // ── Runway ──
  if (latest.runway < 6) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "runway-critical",
      severity: "critical",
      message: `Runway is critically low at ${latest.runway.toFixed(1)} months. Immediate action needed.`,
      metric: "runway",
      value: latest.runway,
      threshold: 6,
      detectedAt: now,
    });
  } else if (latest.runway < 9) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "runway-warning",
      severity: "warning",
      message: `Runway is ${latest.runway.toFixed(1)} months. Consider beginning fundraise conversations.`,
      metric: "runway",
      value: latest.runway,
      threshold: 9,
      detectedAt: now,
    });
  }

  // ── Growth Collapse ──
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2];
    const growth = calcMrrGrowth(latest.mrr, prev.mrr);

    if (growth < 0) {
      alerts.push({
        id: nextAlertId(),
        companyId,
        type: "growth-collapse",
        severity: "critical",
        message: `MRR declined ${growth.toFixed(1)}% month-over-month. Revenue is contracting.`,
        metric: "mrr_growth",
        value: growth,
        threshold: 0,
        detectedAt: now,
      });
    }
  }

  // ── Growth Stall ──
  if (sorted.length >= 3) {
    const growths: number[] = [];
    for (let i = sorted.length - 2; i >= Math.max(0, sorted.length - 4); i--) {
      growths.push(calcMrrGrowth(sorted[i + 1].mrr, sorted[i].mrr));
    }
    const declining = growths.filter((g) => g < growths[growths.length - 1]).length;
    if (declining >= 2 && !alerts.some((a) => a.type === "growth-collapse")) {
      alerts.push({
        id: nextAlertId(),
        companyId,
        type: "growth-stall",
        severity: "warning",
        message: `Growth rate has been declining for ${declining} consecutive months.`,
        metric: "mrr_growth_trend",
        value: growths[0],
        threshold: 0,
        detectedAt: now,
      });
    }
  }

  // ── Burn Spike ──
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2];
    const burnChange = ((latest.burn - prev.burn) / prev.burn) * 100;
    if (burnChange > 25) {
      alerts.push({
        id: nextAlertId(),
        companyId,
        type: "burn-spike",
        severity: "warning",
        message: `Monthly burn increased ${burnChange.toFixed(0)}% to ${formatCompact(latest.burn)}. Monitor spend.`,
        metric: "burn",
        value: burnChange,
        threshold: 25,
        detectedAt: now,
      });
    }
  }

  // ── Churn High ──
  if (latest.churnRate > 10) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "churn-high",
      severity: "critical",
      message: `Monthly churn at ${latest.churnRate.toFixed(1)}% is critically high. Investigating retention is urgent.`,
      metric: "churn_rate",
      value: latest.churnRate,
      threshold: 10,
      detectedAt: now,
    });
  } else if (latest.churnRate > 5) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "churn-high",
      severity: "warning",
      message: `Monthly churn at ${latest.churnRate.toFixed(1)}% is above healthy threshold.`,
      metric: "churn_rate",
      value: latest.churnRate,
      threshold: 5,
      detectedAt: now,
    });
  }

  // ── LTV:CAC ──
  const ratio = calcLtvCacRatio(latest.ltv, latest.cac);
  if (ratio > 0 && ratio < 1.5) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "ltv-cac-unhealthy",
      severity: "critical",
      message: `LTV:CAC ratio is ${ratio.toFixed(1)}x. Unit economics are unsustainable.`,
      metric: "ltv_cac",
      value: ratio,
      threshold: 1.5,
      detectedAt: now,
    });
  } else if (ratio > 0 && ratio < 3) {
    alerts.push({
      id: nextAlertId(),
      companyId,
      type: "ltv-cac-unhealthy",
      severity: "warning",
      message: `LTV:CAC ratio is ${ratio.toFixed(1)}x. Below the 3x benchmark for healthy SaaS.`,
      metric: "ltv_cac",
      value: ratio,
      threshold: 3,
      detectedAt: now,
    });
  }

  return alerts;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function generateAllAlerts(
  companyIds: string[],
  snapshotsMap: Map<string, MonthlySnapshot[]>
): Alert[] {
  alertCounter = 0; // reset for deterministic IDs
  return companyIds.flatMap((id) => {
    const snaps = snapshotsMap.get(id) ?? [];
    return generateAlerts(id, snaps);
  });
}
