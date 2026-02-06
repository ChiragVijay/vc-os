import { Suspense } from "react";
import { AlertsView } from "@/src/components/dashboard/AlertsView";

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-xs font-mono text-vc-secondary">Loading alerts…</div>}>
      <AlertsView />
    </Suspense>
  );
}
