"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const tabs = [
  { label: "Overview", href: "/dashboard" },
  { label: "Benchmarks", href: "/dashboard/benchmarks" },
  { label: "Cohorts", href: "/dashboard/cohorts" },
  { label: "Alerts", href: "/dashboard/alerts" },
];

function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const batch = searchParams.get("batch") ?? "all";
  const sector = searchParams.get("sector") ?? "all";
  const stage = searchParams.get("stage") ?? "all";
  const search = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-vc-border bg-white">
      <select
        value={batch}
        onChange={(e) => updateParam("batch", e.target.value)}
        className={selectClass}
      >
        <option value="all">All Batches</option>
        <option value="W25">W25</option>
        <option value="S25">S25</option>
        <option value="W26">W26</option>
        <option value="S26">S26</option>
      </select>
      <select
        value={sector}
        onChange={(e) => updateParam("sector", e.target.value)}
        className={selectClass}
      >
        <option value="all">All Sectors</option>
        <option value="SaaS">SaaS</option>
        <option value="Fintech">Fintech</option>
        <option value="Health">Health</option>
        <option value="Dev Tools">Dev Tools</option>
        <option value="Marketplace">Marketplace</option>
        <option value="AI/ML">AI/ML</option>
      </select>
      <select
        value={stage}
        onChange={(e) => updateParam("stage", e.target.value)}
        className={selectClass}
      >
        <option value="all">All Stages</option>
        <option value="Pre-Seed">Pre-Seed</option>
        <option value="Seed">Seed</option>
        <option value="Series A">Series A</option>
      </select>
      <input
        type="text"
        value={search}
        onChange={(e) => updateParam("q", e.target.value)}
        placeholder="Search companies..."
        className="border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 flex-1 min-w-40"
      />
    </div>
  );
}

function TabNav() {
  const pathname = usePathname();

  // Don't show tabs on company detail pages
  if (pathname.match(/^\/dashboard\/co_/)) return null;

  return (
    <nav className="flex gap-0 px-6 border-b border-vc-border bg-white">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-3 text-xs font-mono tracking-[0.15em] uppercase transition-colors border-b-2 -mb-px ${
              isActive
                ? "border-accent text-vc-primary"
                : "border-transparent text-vc-secondary hover:text-vc-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCompanyDetail = pathname.match(/^\/dashboard\/co_/);

  return (
    <div className="min-h-screen bg-white text-vc-primary">
      <header className="px-6 py-6 flex justify-between items-baseline border-b border-vc-border">
        <Link href="/" className="text-sm font-bold tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 bg-accent" />
          VC_OS
        </Link>
        <div className="flex items-center gap-6 text-xs font-mono tracking-tight">
          <Link
            href="/"
            className="hover:text-accent transition-colors underline underline-offset-4"
          >
            Home
          </Link>
          <Link
            href="/diligence"
            className="hover:text-accent transition-colors underline underline-offset-4"
          >
            Diligence
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-accent transition-colors underline underline-offset-4 text-accent"
          >
            Dashboard
          </Link>
          <Link
            href="/founder"
            className="hover:text-accent transition-colors underline underline-offset-4"
          >
            Founder
          </Link>
        </div>
      </header>
      <Suspense>
        <TabNav />
        {!isCompanyDetail && <FilterBar />}
      </Suspense>
      {children}
    </div>
  );
}
