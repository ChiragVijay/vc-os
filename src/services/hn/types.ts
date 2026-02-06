export type HNStory = {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
  author: string;
};

export type HNComment = {
  objectID: string;
  text: string;
  storyTitle: string;
  created_at: string;
  author: string;
};

export type HNSummary = {
  totalMentions: number;
  topStories: HNStory[];
  topComments: HNComment[];
  recentMentions: number;
  priorPeriodMentions: number;
  averagePoints: number | null;
  averageComments: number | null;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  trend: "growing" | "stable" | "declining" | "unknown";
};
