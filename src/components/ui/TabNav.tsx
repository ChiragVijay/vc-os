"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Tab {
  label: string;
  href: string;
}

interface TabNavProps {
  tabs: Tab[];
  baseHref: string;
}

export function TabNav({ tabs, baseHref }: TabNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-0 px-6 border-b border-vc-border bg-white">
      {tabs.map((tab) => {
        const isActive =
          tab.href === baseHref
            ? pathname === baseHref
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
