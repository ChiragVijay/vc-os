"use client";

import { PageLayout } from "@/src/components/ui";

export default function CapTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
