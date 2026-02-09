import { Suspense } from "react";
import { PortfolioPositions } from "@/src/components/cap-table/PortfolioPositions";

function LoadingSkeleton() {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-vc-border/40 mb-4" />
      <div className="h-4 w-96 bg-vc-border/40 mb-8" />
      <div className="grid grid-cols-5 gap-0 border border-vc-border mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-vc-border px-3 py-3">
            <div className="h-3 w-16 bg-vc-border/40 mb-2" />
            <div className="h-6 w-24 bg-vc-border/40" />
          </div>
        ))}
      </div>
      <div className="border border-vc-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-vc-border">
            <div className="h-4 w-full bg-vc-border/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CapTablePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PortfolioPositions />
    </Suspense>
  );
}
