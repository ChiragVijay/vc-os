"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Check, X, AlertTriangle } from "lucide-react";
import {
  loadFounderProfile,
  calcHealthScore,
  calcFundraisingReadiness,
  generateActionItems,
  benchmarkFounder,
  generateInvestorUpdate,
} from "@/src/lib/founder";
import type { FounderProfile } from "@/src/lib/founder";
import { ExportButton, type ExportOption } from "@/src/components/export/ExportButton";
import { useRouter } from "next/navigation";

export const ScorecardView = () => {
  const router = useRouter();
  const [profile] = useState<FounderProfile | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFounderProfile();
  });

  const health = useMemo(
    () => (profile ? calcHealthScore(profile.snapshots) : null),
    [profile]
  );

  const readiness = useMemo(
    () => (profile ? calcFundraisingReadiness(profile.snapshots) : null),
    [profile]
  );

  const actionItems = useMemo(
    () => (profile ? generateActionItems(profile.snapshots) : []),
    [profile]
  );

  const benchmarks = useMemo(
    () =>
      profile
        ? benchmarkFounder(profile.snapshots, "batch", profile.company.batch)
        : [],
    [profile]
  );

  useEffect(() => {
    if (!profile) {
      router.push("/founder");
    }
  }, [profile, router]);

  if (!profile || !health || !readiness) {
    return null;
  }

  const healthColor =
    health.overall >= 70
      ? "text-emerald-600"
      : health.overall >= 40
        ? "text-amber-600"
        : "text-rose-500";

  const healthTrack =
    health.overall >= 70
      ? "bg-emerald-500"
      : health.overall >= 40
        ? "bg-amber-500"
        : "bg-rose-500";

  const readinessColor =
    readiness.label === "Ready"
      ? "text-emerald-600"
      : readiness.label === "Getting There"
        ? "text-amber-600"
        : "text-rose-500";

  const subScores = [
    { label: "Growth", value: health.growth, weight: "30%" },
    { label: "Runway", value: health.runway, weight: "20%" },
    { label: "Churn", value: health.churn, weight: "15%" },
    { label: "LTV:CAC", value: health.ltvCac, weight: "15%" },
    { label: "NPS", value: health.nps, weight: "10%" },
    { label: "Efficiency", value: health.burnEfficiency, weight: "10%" },
  ];

  const priorityConfig = {
    high: { color: "text-rose-500", bg: "bg-rose-50 border-rose-200", icon: AlertTriangle },
    medium: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
    low: { color: "text-blue-500", bg: "bg-blue-50 border-blue-200", icon: AlertTriangle },
  };

  const exportOptions: ExportOption[] = [
    {
      id: "investor-update",
      label: "Investor Update (.md)",
      icon: <FileText className="w-4 h-4" />,
      onClick: () => {
        const md = generateInvestorUpdate(profile, benchmarks);
        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${profile.company.name.replace(/\s+/g, "-").toLowerCase()}-update-${new Date().toISOString().split("T")[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
            Health Scorecard
          </div>
          <h1 className="text-2xl font-serif font-light mb-1">
            {profile.company.name} Scorecard
          </h1>
          <p className="text-xs text-vc-tertiary">
            Composite health score, fundraising readiness, and action items.
          </p>
        </div>
        <ExportButton options={exportOptions} label="Export Update" />
      </div>

      {/* Health Score + Sub-scores */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Main Score */}
        <div className="border border-vc-border px-6 py-8 text-center">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-6">
            Overall Health Score
          </div>
          <div className="relative inline-block mb-6">
            <div className={`text-6xl font-light ${healthColor}`}>
              {health.overall}
            </div>
            <div className="text-xs font-mono text-vc-secondary mt-1">
              out of 100
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full h-2 bg-gray-100 mb-2">
            <div
              className={`h-full ${healthTrack} transition-all`}
              style={{ width: `${health.overall}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-vc-secondary">
            <span>Critical</span>
            <span>At Risk</span>
            <span>Healthy</span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="border border-vc-border px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
            Score Breakdown
          </div>
          <div className="space-y-3">
            {subScores.map((sub) => {
              const barColor =
                sub.value >= 70
                  ? "bg-emerald-500"
                  : sub.value >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500";
              return (
                <div key={sub.label}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-mono text-vc-primary">
                      {sub.label}
                    </span>
                    <span className="text-xs font-mono text-vc-secondary">
                      {sub.value} · {sub.weight}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100">
                    <div
                      className={`h-full ${barColor} transition-all`}
                      style={{ width: `${sub.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fundraising Readiness */}
      <div className="border border-vc-border mb-8">
        <div className="px-4 py-3 border-b border-vc-border bg-vc-hover flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            Fundraising Readiness — Series A Benchmarks
          </span>
          <span className={`text-xs font-mono font-medium ${readinessColor}`}>
            {readiness.label} ({readiness.score}%)
          </span>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-vc-border">
          {readiness.signals.map((signal) => (
            <div key={signal.label} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                {signal.met ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-mono text-vc-primary">
                  {signal.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-lg font-light ${
                    signal.met ? "text-emerald-600" : "text-vc-primary"
                  }`}
                >
                  {signal.current}
                </span>
                <span className="text-[11px] font-mono text-vc-secondary">
                  target: {signal.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="border border-vc-border">
          <div className="px-4 py-3 border-b border-vc-border bg-vc-hover">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
              Recommended Actions
            </span>
          </div>
          <div className="divide-y divide-vc-border">
            {actionItems.map((item, idx) => {
              const cfg = priorityConfig[item.priority];
              return (
                <div key={idx} className="px-4 py-4 flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-6 h-6 border flex items-center justify-center ${cfg.bg}`}
                    >
                      <span className={`text-[11px] font-mono font-bold ${cfg.color}`}>
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-[0.2em] ${cfg.color}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-vc-tertiary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
