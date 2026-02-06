"use client";

import { Suspense } from "react";
import { TrajectoryView } from "@/src/components/founder";

export default function FounderTrajectoryPage() {
  return (
    <Suspense>
      <TrajectoryView />
    </Suspense>
  );
}
