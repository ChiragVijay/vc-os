"use client";

import { Suspense } from "react";
import { ScorecardView } from "@/src/components/founder";

export default function FounderScorecardPage() {
  return (
    <Suspense>
      <ScorecardView />
    </Suspense>
  );
}
