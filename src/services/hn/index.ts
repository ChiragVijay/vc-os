import { env } from "../../lib/config";
import type { HNComment, HNSummary, HNStory } from "./types";

const HN_SEARCH_ENDPOINT = "https://hn.algolia.com/api/v1/search";
const HN_SEARCH_BY_DATE_ENDPOINT = "https://hn.algolia.com/api/v1/search_by_date";

type AlgoliaHit = {
  objectID?: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  author?: string;
  comment_text?: string;
};

type AlgoliaResponse = {
  hits?: AlgoliaHit[];
};

const buildHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (env.HN_ALGOLIA_APP_ID && env.HN_ALGOLIA_API_KEY) {
    headers["X-Algolia-Application-Id"] = env.HN_ALGOLIA_APP_ID;
    headers["X-Algolia-API-Key"] = env.HN_ALGOLIA_API_KEY;
  }

  return headers;
};

const fetchAlgolia = async (endpoint: string, query: string) => {
  const url = new URL(endpoint);
  url.searchParams.set("query", query);
  url.searchParams.set("hitsPerPage", "25");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `hn algolia search failed (${response.status}): ${bodyText || response.statusText}`,
    );
  }

  return (await response.json()) as AlgoliaResponse;
};

const mapStory = (hit: AlgoliaHit): HNStory | null => {
  if (!hit.objectID) {
    return null;
  }

  const title = hit.title ?? hit.story_title;

  if (!title || !hit.created_at || !hit.author) {
    return null;
  }

  return {
    objectID: hit.objectID,
    title,
    url: hit.url ?? hit.story_url ?? null,
    points: hit.points ?? 0,
    num_comments: hit.num_comments ?? 0,
    created_at: hit.created_at,
    author: hit.author,
  };
};

const mapComment = (hit: AlgoliaHit): HNComment | null => {
  if (!hit.objectID || !hit.comment_text || !hit.created_at || !hit.author) {
    return null;
  }

  return {
    objectID: hit.objectID,
    text: hit.comment_text,
    storyTitle: hit.story_title ?? hit.title ?? "",
    created_at: hit.created_at,
    author: hit.author,
  };
};

export const searchHNStories = async (companyName: string): Promise<HNStory[]> => {
  const data = await fetchAlgolia(HN_SEARCH_ENDPOINT, companyName);
  return (data.hits ?? []).map(mapStory).filter(Boolean) as HNStory[];
};

export const searchHNComments = async (companyName: string): Promise<HNComment[]> => {
  const data = await fetchAlgolia(HN_SEARCH_BY_DATE_ENDPOINT, companyName);
  return (data.hits ?? []).map(mapComment).filter(Boolean) as HNComment[];
};

export const searchHNHistory = async (companyName: string): Promise<HNStory[]> => {
  const data = await fetchAlgolia(HN_SEARCH_BY_DATE_ENDPOINT, companyName);
  return (data.hits ?? []).map(mapStory).filter(Boolean) as HNStory[];
};

const computeSentiment = (stories: HNStory[], comments: HNComment[]) => {
  if (stories.length === 0 && comments.length === 0) {
    return "unknown" as const;
  }

  const avgPoints =
    stories.reduce((sum, story) => sum + story.points, 0) / Math.max(stories.length, 1);

  if (avgPoints >= 50) {
    return "positive" as const;
  }

  if (avgPoints <= 10) {
    return "negative" as const;
  }

  return "neutral" as const;
};

const countMentionsInPeriod = (
  stories: HNStory[],
  comments: HNComment[],
  daysAgo: number,
  periodLength: number,
) => {
  const now = Date.now();
  const periodStart = now - daysAgo * 24 * 60 * 60 * 1000;
  const periodEnd = now - (daysAgo - periodLength) * 24 * 60 * 60 * 1000;

  const isInPeriod = (dateValue: string) => {
    const time = new Date(dateValue).getTime();
    return time >= periodStart && time < periodEnd;
  };

  return (
    stories.filter((story) => isInPeriod(story.created_at)).length +
    comments.filter((comment) => isInPeriod(comment.created_at)).length
  );
};

const computeTrend = (recentMentions: number, priorMentions: number): HNSummary["trend"] => {
  if (recentMentions === 0 && priorMentions === 0) {
    return "unknown";
  }

  if (priorMentions === 0) {
    return recentMentions > 2 ? "growing" : "stable";
  }

  const ratio = recentMentions / priorMentions;

  if (ratio >= 1.5) {
    return "growing";
  }

  if (ratio <= 0.5) {
    return "declining";
  }

  return "stable";
};

export const getHNSentiment = async (companyName: string): Promise<HNSummary> => {
  const [stories, comments] = await Promise.all([
    searchHNStories(companyName),
    searchHNComments(companyName),
  ]);

  const totalMentions = stories.length + comments.length;
  const topStories = [...stories].sort((a, b) => b.points - a.points).slice(0, 5);

  // Get top comments by story engagement (comments with most context)
  const topComments = [...comments]
    .filter((c) => c.text.length > 50) // Filter out very short comments
    .slice(0, 5);

  const recentMentions = countMentionsInPeriod(stories, comments, 0, 30);
  const priorPeriodMentions = countMentionsInPeriod(stories, comments, 30, 30);

  const averagePoints =
    stories.length === 0
      ? null
      : stories.reduce((sum, story) => sum + story.points, 0) / stories.length;

  const averageComments =
    stories.length === 0
      ? null
      : stories.reduce((sum, story) => sum + story.num_comments, 0) / stories.length;

  return {
    totalMentions,
    topStories,
    topComments,
    recentMentions,
    priorPeriodMentions,
    averagePoints,
    averageComments,
    sentiment: computeSentiment(stories, comments),
    trend: computeTrend(recentMentions, priorPeriodMentions),
  };
};

export type { HNComment, HNSummary, HNStory } from "./types";
