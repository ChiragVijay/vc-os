"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCompanies,
  getSnapshots,
  generateAllAlerts,
} from "@/src/lib/dashboard";
import type { AlertType, Company } from "@/src/lib/dashboard/types";
import {
  AlertTriangle,
  TrendingDown,
  Flame,
  Timer,
  UserMinus,
  DollarSign,
  CircleAlert,
} from "lucide-react";

const alertTypeConfig: Record<
  AlertType,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  "runway-critical": { icon: Timer, label: "Runway" },
  "runway-warning": { icon: Timer, label: "Runway" },
  "growth-stall": { icon: TrendingDown, label: "Growth Stall" },
  "growth-collapse": { icon: TrendingDown, label: "Growth Collapse" },
  "burn-spike": { icon: Flame, label: "Burn Spike" },
  "churn-high": { icon: UserMinus, label: "Churn" },
  "ltv-cac-unhealthy": { icon: DollarSign, label: "LTV:CAC" },
};

export const AlertsView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");

  const batch = searchParams.get("batch") ?? "all";
  const sector = searchParams.get("sector") ?? "all";
  const stage = searchParams.get("stage") ?? "all";
  const search = searchParams.get("q") ?? "";

  const allCompanies = getCompanies();

  const filtered = useMemo(() => {
    return allCompanies.filter((c) => {
      if (batch !== "all" && c.batch !== batch) return false;
      if (sector !== "all" && c.sector !== sector) return false;
      if (stage !== "all" && c.stage !== stage) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allCompanies, batch, sector, stage, search]);

  const companyMap = useMemo(() => {
    const map = new Map<string, Company>();
    filtered.forEach((c) => map.set(c.id, c));
    return map;
  }, [filtered]);

  const snapshotsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSnapshots>>();
    filtered.forEach((c) => map.set(c.id, getSnapshots(c.id)));
    return map;
  }, [filtered]);

  const allAlerts = useMemo(() => {
    return generateAllAlerts(
      filtered.map((c) => c.id),
      snapshotsMap
    );
  }, [filtered, snapshotsMap]);

  const filteredAlerts = useMemo(() => {
    if (typeFilter === "all") return allAlerts;
    return allAlerts.filter((a) => a.type === typeFilter);
  }, [allAlerts, typeFilter]);

  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = allAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = allAlerts.filter((a) => a.severity === "info").length;

  // Group by severity
  const grouped = useMemo(() => {
    const critical = filteredAlerts.filter((a) => a.severity === "critical");
    const warning = filteredAlerts.filter((a) => a.severity === "warning");
    const info = filteredAlerts.filter((a) => a.severity === "info");
    return [...critical, ...warning, ...info];
  }, [filteredAlerts]);

  // Unique alert types for filter buttons
  const alertTypes = useMemo(() => {
    const types = new Set(allAlerts.map((a) => a.type));
    return Array.from(types);
  }, [allAlerts]);

  const severityBorder = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-4 border-l-rose-500";
      case "warning":
        return "border-l-4 border-l-amber-500";
      case "info":
        return "border-l-4 border-l-blue-400";
      default:
        return "";
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
          Alerts
        </div>
        <h1 className="text-2xl font-serif font-light text-vc-primary">
          Portfolio Health Monitoring
        </h1>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-rose-500" />
          <span className="text-xs font-mono text-vc-primary">
            {criticalCount} Critical
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500" />
          <span className="text-xs font-mono text-vc-primary">
            {warningCount} Warning{warningCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400" />
          <span className="text-xs font-mono text-vc-primary">
            {infoCount} Info
          </span>
        </div>
        <span className="text-xs font-mono text-vc-secondary ml-auto">
          {allAlerts.length} total alerts across {filtered.length} companies
        </span>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 text-xs font-mono tracking-tight border transition-colors cursor-pointer ${
            typeFilter === "all"
              ? "border-accent bg-accent text-white"
              : "border-vc-border text-vc-secondary hover:text-vc-primary hover:border-vc-primary"
          }`}
        >
          All
        </button>
        {alertTypes.map((type) => {
          const config = alertTypeConfig[type];
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-mono tracking-tight border transition-colors cursor-pointer ${
                typeFilter === type
                  ? "border-accent bg-accent text-white"
                  : "border-vc-border text-vc-secondary hover:text-vc-primary hover:border-vc-primary"
              }`}
            >
              {config?.label ?? type}
            </button>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {grouped.map((alert) => {
          const company = companyMap.get(alert.companyId);
          const config = alertTypeConfig[alert.type];
          const Icon = config?.icon ?? CircleAlert;

          return (
            <div
              key={alert.id}
              className={`border border-vc-border ${severityBorder(alert.severity)} bg-white px-4 py-4 hover:bg-vc-hover transition-colors cursor-pointer`}
              onClick={() => router.push(`/dashboard/${alert.companyId}`)}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-vc-secondary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-vc-primary">
                      {company?.name ?? alert.companyId}
                    </span>
                    <span className="text-xs font-mono text-vc-secondary">
                      {company?.batch} · {company?.sector}
                    </span>
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider ml-auto ${
                        alert.severity === "critical"
                          ? "text-rose-500"
                          : alert.severity === "warning"
                            ? "text-amber-600"
                            : "text-blue-500"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-vc-tertiary leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {grouped.length === 0 && (
        <div className="border border-vc-border px-6 py-16 text-center">
          <AlertTriangle className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-mono text-vc-primary mb-1">All clear</p>
          <p className="text-xs text-vc-secondary">
            All companies are operating within healthy parameters.
          </p>
        </div>
      )}
    </div>
  );
};
