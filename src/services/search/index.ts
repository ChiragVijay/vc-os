import {
  searchCompanyNews as searchCompanyNewsWithBrave,
  searchCompetitors as searchCompetitorsWithBrave,
  searchFunding as searchFundingWithBrave,
  searchWithBrave,
} from "./brave";
import {
  searchCompanyNews as searchCompanyNewsWithTavily,
  searchCompetitors as searchCompetitorsWithTavily,
  searchFunding as searchFundingWithTavily,
  searchWithTavily,
} from "./tavily";
import { RateLimitError, type SearchOptions, type SearchResult } from "./types";

const runWithFallback = async (
  primary: () => Promise<SearchResult[]>,
  fallback: () => Promise<SearchResult[]>,
) => {
  try {
    return await primary();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return fallback();
    }

    throw error;
  }
};

export const search = (query: string, options?: SearchOptions) =>
  runWithFallback(
    () => searchWithTavily(query, options),
    () => searchWithBrave(query, options),
  );

export const searchCompanyNews = (company: string, options?: SearchOptions) =>
  runWithFallback(
    () => searchCompanyNewsWithTavily(company, options),
    () => searchCompanyNewsWithBrave(company, options),
  );

export const searchCompetitors = (company: string, options?: SearchOptions) =>
  runWithFallback(
    () => searchCompetitorsWithTavily(company, options),
    () => searchCompetitorsWithBrave(company, options),
  );

export const searchFunding = (company: string, options?: SearchOptions) =>
  runWithFallback(
    () => searchFundingWithTavily(company, options),
    () => searchFundingWithBrave(company, options),
  );

export type { SearchOptions, SearchResult } from "./types";
