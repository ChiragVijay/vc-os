export const BATCH_OPTIONS = [
  { value: "all", label: "All Batches" },
  { value: "W25", label: "W25" },
  { value: "S25", label: "S25" },
  { value: "W26", label: "W26" },
  { value: "S26", label: "S26" },
] as const;

export const SECTOR_OPTIONS = [
  { value: "all", label: "All Sectors" },
  { value: "SaaS", label: "SaaS" },
  { value: "Fintech", label: "Fintech" },
  { value: "Health", label: "Health" },
  { value: "Dev Tools", label: "Dev Tools" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "AI/ML", label: "AI/ML" },
] as const;

export const STAGE_OPTIONS = [
  { value: "all", label: "All Stages" },
  { value: "Pre-Seed", label: "Pre-Seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
] as const;

export const DASHBOARD_TABS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Benchmarks", href: "/dashboard/benchmarks" },
  { label: "Cohorts", href: "/dashboard/cohorts" },
  { label: "Alerts", href: "/dashboard/alerts" },
] as const;

export const FOUNDER_TABS = [
  { label: "My Company", href: "/founder" },
  { label: "Benchmarks", href: "/founder/benchmarks" },
  { label: "Trajectory", href: "/founder/trajectory" },
  { label: "Scorecard", href: "/founder/scorecard" },
] as const;

/* ── Shared CSS class strings (DRY) ────────────────────────── */

export const SELECT_CLASS =
  "border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer";

export const INPUT_CLASS =
  "border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40";

