"use client";

import { Suspense } from "react";
import { FounderBenchmarks } from "@/src/components/founder";

export default function FounderBenchmarksPage() {
  return (
    <Suspense>
      <FounderBenchmarks />
    </Suspense>
  );
}
