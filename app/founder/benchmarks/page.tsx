import { Suspense } from "react";
import { FounderBenchmarks } from "@/src/components/founder";

export default function FounderBenchmarksPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading benchmarks…</div>}>
      <FounderBenchmarks />
    </Suspense>
  );
}
