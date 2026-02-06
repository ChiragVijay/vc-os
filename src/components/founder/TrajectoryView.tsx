"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  loadFounderProfile,
  generateProjection,
  generateScenarios,
  growthTrend,
  momGrowthRates,
  getAnonymizedBatchCurves,
  avgRecentGrowth,
} from "@/src/lib/founder";
import type { FounderProfile } from "@/src/lib/founder";
import { formatCurrency } from "@/src/lib/dashboard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

export const TrajectoryView = () => {
  const router = useRouter();
  const [profile] = useState<FounderProfile | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFounderProfile();
  });

  useEffect(() => {
    if (!profile) {
      router.push("/founder");
    }
  }, [profile, router]);

  const projection = useMemo(
    () => (profile ? generateProjection(profile.snapshots, 6) : []),
    [profile]
  );

  const scenarios = useMemo(
    () => (profile ? generateScenarios(profile.snapshots) : []),
    [profile]
  );

  const trend = useMemo(
    () => (profile ? growthTrend(profile.snapshots) : "stable"),
    [profile]
  );

  const growthRates = useMemo(
    () => (profile ? momGrowthRates(profile.snapshots) : []),
    [profile]
  );

  const batchCurves = useMemo(
    () => (profile ? getAnonymizedBatchCurves(profile.company.batch) : []),
    [profile]
  );

  const avgGrowth = useMemo(
    () => (profile ? avgRecentGrowth(profile.snapshots, 3) : 0),
    [profile]
  );

  if (!profile) return null;

  const sorted = [...profile.snapshots].sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  const trendIcon =
    trend === "accelerating"
      ? TrendingUp
      : trend === "decelerating"
        ? TrendingDown
        : Minus;
  const trendColor =
    trend === "accelerating"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : trend === "decelerating"
        ? "text-rose-500 bg-rose-50 border-rose-200"
        : "text-vc-secondary bg-gray-50 border-vc-border";

  const TrendIcon = trendIcon;

  // Build founder curve for overlay
  const founderCurve = sorted.map((s, i) => ({ monthIndex: i, mrr: s.mrr }));

  // Build overlay chart data — merge all curves by monthIndex
  const maxMonths = Math.max(
    founderCurve.length,
    ...batchCurves.map((c) => c.data.length)
  );

  const overlayData = Array.from({ length: maxMonths }, (_, i) => {
    const point: Record<string, number | undefined> = { monthIndex: i };
    point.founder = founderCurve[i]?.mrr;
    batchCurves.forEach((c) => {
      point[`co_${c.curveId}`] = c.data[i]?.mrr;
    });
    return point;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
          Growth Trajectory
        </div>
        <h1 className="text-2xl font-serif font-light mb-1">
          MRR Projection & Scenario Analysis
        </h1>
        <p className="text-xs text-vc-tertiary">
          Historical performance with forward projections and anonymized batch comparison.
        </p>
      </div>

      {/* Growth Trend Badge */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`inline-flex items-center gap-2 border px-4 py-2 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-[0.15em]">
            {trend}
          </span>
        </div>
        <div className="text-xs font-mono text-vc-secondary">
          Avg 3mo growth: {avgGrowth.toFixed(1)}% MoM
        </div>
      </div>

      {/* MRR Projection Chart */}
      <div className="border border-vc-border mb-8">
        <div className="px-4 py-3 border-b border-vc-border bg-vc-hover flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            MRR Projection (6 months)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono text-vc-secondary">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-vc-primary inline-block" /> Historical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-accent inline-block border-dashed" /> Projected
            </span>
          </div>
        </div>
        <div className="px-4 py-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "6px 10px",
                  }}
                  formatter={(value: number | undefined) => [
                    formatCurrency(value ?? 0, true),
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#111111"
                  fill="#f26522"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: "#f26522" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {scenarios.map((s) => (
          <div
            key={s.label}
            className={`border px-4 py-4 ${
              s.label === "Current Pace"
                ? "border-accent bg-accent/5"
                : "border-vc-border"
            }`}
          >
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
              {s.label}
            </div>
            <div className="text-xs font-mono text-vc-secondary mb-1">
              {s.growthRate.toFixed(1)}% MoM
            </div>
            <div className="space-y-2 mt-3">
              <div>
                <div className="text-[11px] font-mono text-vc-secondary">
                  MRR in 6mo
                </div>
                <div className="text-lg font-light">
                  {formatCurrency(s.projectedMrr6mo, true)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-vc-secondary">
                  MRR in 12mo
                </div>
                <div className="text-lg font-light">
                  {formatCurrency(s.projectedMrr12mo, true)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-vc-secondary">
                  ARR in 12mo
                </div>
                <div className="text-lg font-light text-accent">
                  {formatCurrency(s.projectedArr12mo, true)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MoM Growth Rate Chart */}
      <div className="border border-vc-border mb-8">
        <div className="px-4 py-3 border-b border-vc-border bg-vc-hover">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            Month-over-Month Growth Rates
          </span>
        </div>
        <div className="px-4 py-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthRates}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "6px 10px",
                  }}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, "Growth"]}
                />
                <ReferenceLine y={0} stroke="#e5e5e5" />
                {/* Using Bar from recharts but imported as BarChart */}
                <Bar
                  dataKey="growth"
                  radius={0}
                  fill="#f26522"
                  fillOpacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Batch Overlay Chart */}
      <div className="border border-vc-border">
        <div className="px-4 py-3 border-b border-vc-border bg-vc-hover flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            {profile.company.batch} Batch MRR Curves (Anonymized)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono text-vc-secondary">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-gray-300 inline-block" /> Batch companies
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-accent inline-block" /> You
            </span>
          </div>
        </div>
        <div className="px-4 py-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="monthIndex"
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                  label={{
                    value: "Months since batch start",
                    position: "insideBottom",
                    offset: -5,
                    style: { fontSize: 10, fontFamily: "monospace", fill: "#888" },
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "6px 10px",
                  }}
                  formatter={(value: number | undefined) => [
                    formatCurrency(value ?? 0, true),
                    "",
                  ]}
                />
                {/* Anonymized batch curves */}
                {batchCurves.map((c) => (
                  <Line
                    key={c.curveId}
                    type="monotone"
                    dataKey={`co_${c.curveId}`}
                    stroke="#d4d4d4"
                    strokeWidth={1}
                    dot={false}
                    activeDot={false}
                    name={`Company ${c.curveId + 1}`}
                  />
                ))}
                {/* Founder curve */}
                <Line
                  type="monotone"
                  dataKey="founder"
                  stroke="#f26522"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#f26522" }}
                  name="You"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2 text-[11px] font-mono text-vc-secondary">
            No company names or identifying information shown
          </div>
        </div>
      </div>
    </div>
  );
};
