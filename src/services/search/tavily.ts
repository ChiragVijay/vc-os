import { env } from "../../lib/config";
import { RateLimitError, type SearchOptions, type SearchResult } from "./types";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

type TavilySearchParams = {
  query: string;
  max_results: number;
  search_depth: "basic" | "advanced";
  include_answer: boolean;
  include_raw_content: boolean;
  include_images: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
};

type TavilySearchResponse = {
  results?: {
    title?: string;
    url?: string;
    content?: string;
    score?: number;
  }[];
};

const DEFAULT_MAX_RESULTS = 6;
const DEFAULT_DEPTH: "basic" | "advanced" = "basic";

const buildParams = (query: string, options?: SearchOptions): TavilySearchParams => ({
  query,
  max_results: options?.maxResults ?? DEFAULT_MAX_RESULTS,
  search_depth: options?.depth ?? DEFAULT_DEPTH,
  include_answer: false,
  include_raw_content: true,
  include_images: false,
});

const mapResults = (response: TavilySearchResponse): SearchResult[] =>
  (response.results ?? []).map((result) => ({
    title: result.title ?? "",
    url: result.url ?? "",
    content: result.content ?? "",
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

export const searchWithTavily = async (
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> => {
  const payload = {
    api_key: env.TAVILY_API_KEY,
    ...buildParams(query, options),
  };

  const response = await fetch(TAVILY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw normalizeError("tavily", response, bodyText);
  }

  const data = (await response.json()) as TavilySearchResponse;
  return mapResults(data);
};

export const searchCompanyNews = (company: string, options?: SearchOptions) =>
  searchWithTavily(`${company} company news`, options);

export const searchCompetitors = (company: string, options?: SearchOptions) =>
  searchWithTavily(`${company} competitors`, options);

export const searchFunding = (company: string, options?: SearchOptions) =>
  searchWithTavily(`${company} funding rounds`, options);
