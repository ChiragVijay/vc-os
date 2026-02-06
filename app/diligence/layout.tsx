import Link from "next/link";

export default function DiligenceLayout({ children }: { children: React.ReactNode }) {
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
            Diligence Agent
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
