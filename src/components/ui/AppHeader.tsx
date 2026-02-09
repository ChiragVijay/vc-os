"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/diligence", label: "Diligence" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cap-table", label: "Cap Table" },
  { href: "/founder", label: "Founder" },
] as const;

interface AppHeaderProps {
  showNav?: boolean;
}

export function AppHeader({ showNav = true }: AppHeaderProps) {
  const pathname = usePathname();

  const getActiveSection = () => {
    if (pathname.startsWith("/dashboard")) return "/dashboard";
    if (pathname.startsWith("/diligence")) return "/diligence";
    if (pathname.startsWith("/cap-table")) return "/cap-table";
    if (pathname.startsWith("/founder")) return "/founder";
    return "/";
  };

  const activeSection = getActiveSection();

  return (
    <header className="px-4 py-4 md:px-6 md:py-6 flex justify-between items-baseline border-b border-vc-border">
      <Link
        href="/"
        className="text-xs md:text-sm font-bold tracking-tight flex items-center gap-1.5 md:gap-2"
      >
        <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-accent" />
        VC_OS
      </Link>
      {showNav && (
        <nav className="flex items-center gap-2 md:gap-6 text-[10px] md:text-xs font-mono tracking-tight">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-accent transition-colors underline underline-offset-4 ${
                activeSection === link.href ? "text-accent" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
