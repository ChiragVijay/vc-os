import { Suspense } from "react";
import { BenchmarkView } from "@/src/components/dashboard/BenchmarkView";

export default function BenchmarksPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading benchmarks…</div>}>
      <BenchmarkView />
    </Suspense>
  );
}
