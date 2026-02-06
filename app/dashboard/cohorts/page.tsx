import { Suspense } from "react";
import { CohortAnalysis } from "@/src/components/dashboard/CohortAnalysis";

export default function CohortsPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading cohorts…</div>}>
      <CohortAnalysis />
    </Suspense>
  );
}
