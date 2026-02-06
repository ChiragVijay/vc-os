"use client";

import { Suspense } from "react";
import { FounderOnboarding } from "@/src/components/founder/FounderOnboarding";

export default function FounderPage() {
  return (
    <Suspense>
      <FounderOnboarding />
    </Suspense>
  );
}
