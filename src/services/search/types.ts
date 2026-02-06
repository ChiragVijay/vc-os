export type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number | null;
};

export type SearchOptions = {
  maxResults?: number;
  depth?: "basic" | "advanced";
};

export class RateLimitError extends Error {
  readonly provider: string;
  readonly status: number;

  constructor(provider: string, message: string, status = 429) {
    super(message);
    this.name = "RateLimitError";
    this.provider = provider;
    this.status = status;
  }
}
