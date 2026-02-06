"use client";

import { Suspense } from "react";
import { BenchmarkView } from "@/src/components/dashboard/BenchmarkView";

export default function BenchmarksPage() {
  return (
    <Suspense>
      <BenchmarkView />
    </Suspense>
  );
}
