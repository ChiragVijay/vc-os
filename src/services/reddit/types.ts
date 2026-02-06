export type RedditPost = {
  id: string;
  title: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
  subreddit: string;
  selftext: string;
};

export type SubredditResult = {
  name: string;
  title: string;
  subscribers: number;
  url: string;
  description: string;
};

export type RedditSummary = {
  totalMentions: number;
  topPosts: RedditPost[];
  relevantSubreddits: string[];
  averageScore: number | null;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
};
