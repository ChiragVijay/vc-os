import { Suspense } from "react";
import { ScorecardView } from "@/src/components/founder";

export default function FounderScorecardPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading scorecard…</div>}>
      <ScorecardView />
    </Suspense>
  );
}
