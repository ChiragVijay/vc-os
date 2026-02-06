import { z } from "zod";

const envSchema = z.object({
  GOOGLE_GENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),
  HN_ALGOLIA_APP_ID: z.string().optional(),
  HN_ALGOLIA_API_KEY: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  REDDIT_USER_AGENT: z.string().optional(),
});

export const env = envSchema.parse({
  GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  BRAVE_SEARCH_API_KEY: process.env.BRAVE_SEARCH_API_KEY,
  HN_ALGOLIA_APP_ID: process.env.HN_ALGOLIA_APP_ID,
  HN_ALGOLIA_API_KEY: process.env.HN_ALGOLIA_API_KEY,
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
});

export const getMissingEnvKeys = (keys: Array<keyof typeof env>) =>
  keys.filter((key) => !env[key] || env[key]?.trim() === "");
