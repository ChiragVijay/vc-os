import { Suspense } from "react";
import { TrajectoryView } from "@/src/components/founder";

export default function FounderTrajectoryPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading trajectory…</div>}>
      <TrajectoryView />
    </Suspense>
  );
}
