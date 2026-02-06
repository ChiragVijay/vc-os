"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "My Company", href: "/founder" },
  { label: "Benchmarks", href: "/founder/benchmarks" },
  { label: "Trajectory", href: "/founder/trajectory" },
  { label: "Scorecard", href: "/founder/scorecard" },
];

function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-0 px-6 border-b border-vc-border bg-white">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/founder"
            ? pathname === "/founder"
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

export default function FounderLayout({ children }: { children: React.ReactNode }) {
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
            className="hover:text-accent transition-colors underline underline-offset-4"
          >
            Dashboard
          </Link>
          <Link
            href="/founder"
            className="hover:text-accent transition-colors underline underline-offset-4 text-accent"
          >
            Founder
          </Link>
        </div>
      </header>
      <TabNav />
      {children}
    </div>
  );
}
