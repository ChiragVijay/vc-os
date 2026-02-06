"use client";

import { Suspense } from "react";
import { PortfolioOverview } from "@/src/components/dashboard/PortfolioOverview";

export default function DashboardPage() {
  return (
    <Suspense>
      <PortfolioOverview />
    </Suspense>
  );
}
