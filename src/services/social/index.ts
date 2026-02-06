import { getHNSentiment, type HNSummary } from "../hn";

export type SocialHighlight = {
  source: "hn" | "reddit";
  title: string;
  url: string;
  score: number;
};

export type SocialScore = {
  hn: HNSummary | null;
  reddit: null;
  overallSentiment: "positive" | "neutral" | "negative" | "unknown";
  sourcesChecked: string[];
  highlights: SocialHighlight[];
};

const buildHNHighlights = (hn: HNSummary | null): SocialHighlight[] => {
  if (!hn) {
    return [];
  }

  return hn.topStories.map((story) => ({
    source: "hn",
    title: story.title,
    url: story.url ?? `https://news.ycombinator.com/item?id=${story.objectID}`,
    score: story.points,
  }));
};

const toSentimentScore = (sentiment: SocialScore["overallSentiment"]): number => {
  switch (sentiment) {
    case "positive":
      return 1;
    case "negative":
      return -1;
    case "neutral":
      return 0;
    case "unknown":
    default:
      return 0;
  }
};

const deriveOverallSentiment = (hn: HNSummary | null): SocialScore["overallSentiment"] => {
  const sentiments = [hn?.sentiment].filter((value): value is SocialScore["overallSentiment"] =>
    Boolean(value),
  );

  if (sentiments.length === 0) {
    return "unknown";
  }

  if (sentiments.every((value) => value === "unknown")) {
    return "unknown";
  }

  const score =
    sentiments.reduce((sum, value) => sum + toSentimentScore(value), 0) / sentiments.length;

  if (score >= 0.35) {
    return "positive";
  }

  if (score <= -0.35) {
    return "negative";
  }

  return "neutral";
};

export const getSocialScore = async (companyName: string): Promise<SocialScore> => {
  const hnResult = await Promise.allSettled([getHNSentiment(companyName)]);
  const hn = hnResult[0].status === "fulfilled" ? hnResult[0].value : null;
  const sourcesChecked = [hn ? "hn" : null].filter(Boolean) as string[];

  const highlights = buildHNHighlights(hn)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    hn,
    reddit: null,
    overallSentiment: deriveOverallSentiment(hn),
    sourcesChecked,
    highlights,
  };
};
