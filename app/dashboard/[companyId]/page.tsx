"use client";

import { useParams } from "next/navigation";
import { CompanyDetail } from "@/src/components/dashboard/CompanyDetail";

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.companyId as string;

  return <CompanyDetail companyId={companyId} />;
}
