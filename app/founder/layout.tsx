"use client";

import { PageLayout, TabNav } from "@/src/components/ui";
import { FOUNDER_TABS } from "@/src/lib/constants";

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout>
      <TabNav tabs={[...FOUNDER_TABS]} baseHref="/founder" />
      {children}
    </PageLayout>
  );
}
