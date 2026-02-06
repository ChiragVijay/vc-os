import { Suspense } from "react";
import { PortfolioOverview } from "@/src/components/dashboard/PortfolioOverview";

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PortfolioOverview />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-4 w-32 bg-vc-border mb-2" />
      <div className="h-8 w-48 bg-vc-border mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-vc-border mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-5 border border-vc-border">
            <div className="h-3 w-20 bg-vc-border mb-2" />
            <div className="h-6 w-16 bg-vc-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
