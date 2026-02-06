import { env } from "../../lib/config";
import type { RedditPost, RedditSummary, SubredditResult } from "./types";

const REDDIT_SEARCH_ENDPOINT = "https://www.reddit.com/search.json";
const REDDIT_SUBREDDIT_SEARCH_ENDPOINT = "https://www.reddit.com/subreddits/search.json";

type RedditListing<T> = {
  data?: {
    children?: {
      data?: T;
    }[];
  };
};

type RedditPostPayload = {
  id?: string;
  title?: string;
  url?: string;
  score?: number;
  num_comments?: number;
  created_utc?: number;
  author?: string;
  subreddit?: string;
  selftext?: string;
};

type SubredditPayload = {
  display_name?: string;
  title?: string;
  subscribers?: number;
  url?: string;
  public_description?: string;
};

export type RedditSearchSort = "relevance" | "hot" | "top" | "new" | "comments";

export type RedditSearchParams = {
  query: string;
  subreddit?: string;
  sort?: RedditSearchSort;
  limit?: number;
};

export type SubredditSearchParams = {
  query: string;
  limit?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchReddit = async (url: string) => {
  await sleep(1200);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": env.REDDIT_USER_AGENT ?? "vc-os/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`reddit api error (${response.status}): ${bodyText || response.statusText}`);
  }

  return response.json();
};

const mapPost = (payload: RedditPostPayload): RedditPost | null => {
  if (!payload.id || !payload.title || !payload.author || !payload.subreddit) {
    return null;
  }

  return {
    id: payload.id,
    title: payload.title,
    url: payload.url ?? "",
    score: payload.score ?? 0,
    num_comments: payload.num_comments ?? 0,
    created_utc: payload.created_utc ?? 0,
    author: payload.author,
    subreddit: payload.subreddit,
    selftext: payload.selftext ?? "",
  };
};

const mapSubreddit = (payload: SubredditPayload): SubredditResult | null => {
  if (!payload.display_name || !payload.title) {
    return null;
  }

  return {
    name: payload.display_name,
    title: payload.title,
    subscribers: payload.subscribers ?? 0,
    url: `https://www.reddit.com${payload.url ?? ""}`,
    description: payload.public_description ?? "",
  };
};

export const searchReddit = async (params: RedditSearchParams): Promise<RedditPost[]> => {
  const { query, subreddit, sort = "relevance", limit = 25 } = params;
  const url = new URL(REDDIT_SEARCH_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", sort);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("restrict_sr", subreddit ? "1" : "0");
  if (subreddit) {
    url.searchParams.set("sr_name", subreddit);
  }

  const data = (await fetchReddit(url.toString())) as RedditListing<RedditPostPayload>;
  return (data.data?.children ?? [])
    .map((child) => mapPost(child.data ?? {}))
    .filter(Boolean) as RedditPost[];
};

export const searchSubreddits = async (
  params: SubredditSearchParams,
): Promise<SubredditResult[]> => {
  const { query, limit = 10 } = params;
  const url = new URL(REDDIT_SUBREDDIT_SEARCH_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));

  const data = (await fetchReddit(url.toString())) as RedditListing<SubredditPayload>;
  return (data.data?.children ?? [])
    .map((child) => mapSubreddit(child.data ?? {}))
    .filter(Boolean) as SubredditResult[];
};

const computeSentiment = (posts: RedditPost[]) => {
  if (posts.length === 0) {
    return "unknown" as const;
  }

  const averageScore = posts.reduce((sum, post) => sum + post.score, 0) / posts.length;

  if (averageScore >= 50) {
    return "positive" as const;
  }

  if (averageScore <= 5) {
    return "negative" as const;
  }

  return "neutral" as const;
};

export const getRedditSentiment = async (companyName: string): Promise<RedditSummary> => {
  const posts = await searchReddit({ query: companyName, limit: 50 });

  const totalMentions = posts.length;
  const topPosts = [...posts].sort((a, b) => b.score - a.score).slice(0, 5);
  const averageScore =
    posts.length === 0 ? null : posts.reduce((sum, post) => sum + post.score, 0) / posts.length;
  const relevantSubreddits = Array.from(new Set(posts.map((post) => post.subreddit))).slice(0, 5);

  return {
    totalMentions,
    topPosts,
    relevantSubreddits,
    averageScore,
    sentiment: computeSentiment(posts),
  };
};

export type { RedditPost, RedditSummary, SubredditResult } from "./types";
