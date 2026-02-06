import { env } from "../../lib/config";
import { RateLimitError, type SearchOptions, type SearchResult } from "./types";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

type BraveSearchResponse = {
  web?: {
    results?: {
      title?: string;
      url?: string;
      description?: string;
      score?: number;
    }[];
  };
};

const DEFAULT_MAX_RESULTS = 6;

const mapResults = (response: BraveSearchResponse): SearchResult[] =>
  (response.web?.results ?? []).map((result) => ({
    title: result.title ?? "",
    url: result.url ?? "",
    content: result.description ?? "",
    score: typeof result.score === "number" ? result.score : null,
  }));

const normalizeError = (provider: string, response: Response, bodyText: string) => {
  if (response.status === 429) {
    return new RateLimitError(
      provider,
      `${provider} rate limit exceeded: ${bodyText || response.statusText}`,
      response.status,
    );
  }

  return new Error(
    `${provider} search failed (${response.status}): ${bodyText || response.statusText}`,
  );
};

export const searchWithBrave = async (
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> => {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;
  const requestUrl = new URL(BRAVE_ENDPOINT);
  requestUrl.searchParams.set("q", query);
  requestUrl.searchParams.set("count", String(maxResults));

  const response = await fetch(requestUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": env.BRAVE_SEARCH_API_KEY ?? "",
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw normalizeError("brave", response, bodyText);
  }

  const data = (await response.json()) as BraveSearchResponse;
  return mapResults(data);
};

export const searchCompanyNews = (company: string, options?: SearchOptions) =>
  searchWithBrave(`${company} company news`, options);

export const searchCompetitors = (company: string, options?: SearchOptions) =>
  searchWithBrave(`${company} competitors`, options);

export const searchFunding = (company: string, options?: SearchOptions) =>
  searchWithBrave(`${company} funding rounds`, options);
