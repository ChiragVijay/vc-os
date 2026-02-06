import { Suspense } from "react";
import { FounderOnboarding } from "@/src/components/founder/FounderOnboarding";

export default function FounderPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading…</div>}>
      <FounderOnboarding />
    </Suspense>
  );
}
