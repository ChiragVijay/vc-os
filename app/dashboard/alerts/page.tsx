"use client";

import { Suspense } from "react";
import { AlertsView } from "@/src/components/dashboard/AlertsView";

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsView />
    </Suspense>
  );
}
