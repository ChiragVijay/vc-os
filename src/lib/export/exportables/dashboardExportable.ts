import type { Exportable, ExportDocument, ExportBlock, ExportKind } from "../types";
import { getDateStamp } from "../utils/filenames";
import type { Company, MonthlySnapshot } from "../../dashboard/types";
import {
  latestSnapshot,
  previousSnapshot,
  calcMrrGrowth,
  calcArr,
  calcLtvCacRatio,
  formatCurrency,
  formatNumber,
} from "../../dashboard/metrics";
import { generateAlerts } from "../../dashboard/alerts";

export type DashboardExportPayload = {
  company: Company;
  snapshots: MonthlySnapshot[];
};

export const dashboardExportable: Exportable<DashboardExportPayload> = {
  kind: "companyReport" as ExportKind,

  buildDocument(payload: DashboardExportPayload): ExportDocument {
    const { company, snapshots } = payload;
    const latest = latestSnapshot(snapshots);
    const prev = previousSnapshot(snapshots);
    const growth = latest && prev ? calcMrrGrowth(latest.mrr, prev.mrr) : 0;
    const arr = latest ? calcArr(latest.mrr) : 0;
    const ltvCac = latest ? calcLtvCacRatio(latest.ltv, latest.cac) : 0;
    const alerts = generateAlerts(company.id, snapshots);

    const blocks: ExportBlock[] = [];

    // Company Overview
    blocks.push({ type: "heading", level: 1, text: company.name });
    blocks.push({
      type: "paragraph",
      content: { text: company.description },
    });
    blocks.push({ type: "divider" });

    // Key Info
    blocks.push({ type: "heading", level: 2, text: "Company Overview" });
    blocks.push({ type: "keyValue", key: "Sector", value: company.sector });
    blocks.push({ type: "keyValue", key: "Batch", value: company.batch });
    blocks.push({ type: "keyValue", key: "Stage", value: company.stage });
    blocks.push({ type: "keyValue", key: "Team Size", value: company.teamSize.toString() });
    blocks.push({ type: "divider" });

    // Key Metrics
    blocks.push({ type: "heading", level: 2, text: "Key Metrics (Latest)" });
    if (latest) {
      blocks.push({ type: "keyValue", key: "MRR", value: formatCurrency(latest.mrr) });
      blocks.push({ type: "keyValue", key: "ARR", value: formatCurrency(arr) });
      blocks.push({
        type: "keyValue",
        key: "MoM Growth",
        value: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
      });
      blocks.push({
        type: "keyValue",
        key: "Monthly Burn",
        value: formatCurrency(latest.burn),
      });
      blocks.push({
        type: "keyValue",
        key: "Runway",
        value: `${latest.runway.toFixed(1)} months`,
      });
      blocks.push({
        type: "keyValue",
        key: "Customers",
        value: formatNumber(latest.customers),
      });
      blocks.push({
        type: "keyValue",
        key: "Monthly Churn",
        value: `${latest.churnRate.toFixed(1)}%`,
      });
      blocks.push({
        type: "keyValue",
        key: "LTV:CAC Ratio",
        value: `${ltvCac.toFixed(1)}x`,
      });
      blocks.push({ type: "keyValue", key: "NPS", value: latest.nps.toString() });
    }
    blocks.push({ type: "divider" });

    // Alerts
    if (alerts.length > 0) {
      blocks.push({ type: "heading", level: 2, text: "Active Alerts" });
      blocks.push({
        type: "bullets",
        items: alerts.map((a) => ({
          text: `[${a.severity.toUpperCase()}] ${a.message}`,
        })),
      });
      blocks.push({ type: "divider" });
    }

    // Monthly Data
    blocks.push({ type: "heading", level: 2, text: "Monthly Data" });
    const sorted = [...snapshots].sort((a, b) => b.month.localeCompare(a.month));
    blocks.push({
      type: "paragraph",
      content: {
        text: `| Month | MRR | Burn | Runway | Customers | Churn | LTV | CAC | NPS |\n|---|---|---|---|---|---|---|---|---|\n${sorted
          .map(
            (s) =>
              `| ${s.month} | ${formatCurrency(s.mrr, true)} | ${formatCurrency(s.burn, true)} | ${s.runway.toFixed(1)} | ${formatNumber(s.customers)} | ${s.churnRate.toFixed(1)}% | ${formatCurrency(s.ltv, true)} | ${formatCurrency(s.cac, true)} | ${s.nps} |`
          )
          .join("\n")}`,
      },
    });

    return {
      title: `${company.name} — Company Report`,
      subtitle: `Batch ${company.batch} · ${company.sector} · ${company.stage}`,
      meta: {
        "Generated": getDateStamp(),
        "Sector": company.sector,
        "Stage": company.stage,
      },
      blocks,
      fileBaseName: `${company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report`,
    };
  },
};
