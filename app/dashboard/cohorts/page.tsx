"use client";

import { Suspense } from "react";
import { CohortAnalysis } from "@/src/components/dashboard/CohortAnalysis";

export default function CohortsPage() {
  return (
    <Suspense>
      <CohortAnalysis />
    </Suspense>
  );
}
