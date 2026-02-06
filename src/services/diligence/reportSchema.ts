import { z } from "zod";

export const citedTextSchema = z.object({
  text: z.string(),
  citations: z.array(z.string()).default([]), // source IDs like "src_001"
});

export type CitedText = z.infer<typeof citedTextSchema>;

export const diligenceReportSchema = z.object({
  executiveSummary: z.object({
    overview: citedTextSchema,
    keyFindings: z.array(citedTextSchema),
    risks: z.array(citedTextSchema),
  }),
  marketAnalysis: z.object({
    tam: citedTextSchema,
    marketGrowth: citedTextSchema,
    customerSegments: z.array(citedTextSchema),
    competition: z.array(citedTextSchema),
  }),
  socialSentiment: z.object({
    overallSentiment: z.string(),
    communityPulse: z.string().optional(), // 2-3 sentence summary of HN community perception
    keyConcerns: z.array(citedTextSchema).optional(), // Main criticisms from HN
    keyPraises: z.array(citedTextSchema).optional(), // Main positives from HN
    hiddenGems: z.array(citedTextSchema).optional(), // Unique insights VCs should know
    highlights: z.array(citedTextSchema).default([]),
    mentionTrend: z.enum(["growing", "stable", "declining", "unknown"]).optional(),
  }),
  swotAnalysis: z.object({
    strengths: z.array(citedTextSchema),
    weaknesses: z.array(citedTextSchema),
    opportunities: z.array(citedTextSchema),
    threats: z.array(citedTextSchema),
  }),
  investmentThesis: z.object({
    summary: citedTextSchema,
    upside: z.array(citedTextSchema),
    concerns: z.array(citedTextSchema),
  }),
  aiConfidenceScore: z.object({
    reasoning: z.string(),
  }),
});

export type DiligenceReport = z.infer<typeof diligenceReportSchema>;

export type NormalizedSource = {
  id: string; // e.g., "src_001"
  type: "news" | "funding" | "competitor" | "hn" | "reddit" | "website";
  title: string;
  url: string;
  snippet: string;
  score: number | null;
};

export { buildDiligencePrompt, type DiligencePromptInput } from "./diligencePrompt";
