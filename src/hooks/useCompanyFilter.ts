"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getCompanies } from "@/src/lib/dashboard";
import type { Company } from "@/src/lib/dashboard/types";

export interface CompanyFilterParams {
  batch: string;
  sector: string;
  stage: string;
  search: string;
}

/**
 * Hook that reads filter params from the URL and returns
 * filtered companies. Used by PortfolioOverview, BenchmarkView,
 * AlertsView, and CohortAnalysis to avoid duplicating filter logic.
 */
export function useCompanyFilter(): {
  filtered: Company[];
  params: CompanyFilterParams;
} {
  const searchParams = useSearchParams();

  const batch = searchParams.get("batch") ?? "all";
  const sector = searchParams.get("sector") ?? "all";
  const stage = searchParams.get("stage") ?? "all";
  const search = searchParams.get("q") ?? "";

  const allCompanies = getCompanies();

  const filtered = useMemo(() => {
    return allCompanies.filter((c) => {
      if (batch !== "all" && c.batch !== batch) return false;
      if (sector !== "all" && c.sector !== sector) return false;
      if (stage !== "all" && c.stage !== stage) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [allCompanies, batch, sector, stage, search]);

  return {
    filtered,
    params: { batch, sector, stage, search },
  };
}
