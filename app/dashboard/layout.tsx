"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { PageLayout, TabNav, FilterBar } from "@/src/components/ui";
import {
  DASHBOARD_TABS,
  BATCH_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
} from "@/src/lib/constants";

const DASHBOARD_FILTERS = [
  { key: "batch", options: BATCH_OPTIONS },
  { key: "sector", options: SECTOR_OPTIONS },
  { key: "stage", options: STAGE_OPTIONS },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCompanyDetail = pathname.match(/^\/dashboard\/co_/);

  return (
    <PageLayout>
      <Suspense fallback={null}>
        {!isCompanyDetail && (
          <>
            <TabNav tabs={[...DASHBOARD_TABS]} baseHref="/dashboard" />
            <FilterBar
              filters={DASHBOARD_FILTERS}
              showSearch
              searchPlaceholder="Search companies..."
            />
          </>
        )}
      </Suspense>
      {children}
    </PageLayout>
  );
}
