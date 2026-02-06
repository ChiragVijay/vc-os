import { generateJson } from "../gemini";
import { getMissingEnvKeys } from "@/src/lib/config";
import {
  buildDiligencePrompt,
  diligenceReportSchema,
  type DiligenceReport,
  type NormalizedSource,
} from "./reportSchema";
import { searchCompanyNews, searchCompetitors, searchFunding } from "../search";
import { getSocialScore } from "../social";

export type DiligenceProgressStage =
  | "normalize-input"
  | "search-news"
  | "search-funding"
  | "search-competitors"
  | "social-sentiment"
  | "analysis"
  | "complete"
  | "error";

export type DiligenceProgressEvent = {
  stage: DiligenceProgressStage;
  message: string;
};

export type GenerateDiligenceInput = {
  companyUrl: string;
  companyName?: string;
};

export type DiligenceProgressCallback = (event: DiligenceProgressEvent) => void | Promise<void>;

const notify = async (
  callback: DiligenceProgressCallback | undefined,
  stage: DiligenceProgressStage,
  message: string,
) => {
  if (!callback) {
    return;
  }

  await callback({ stage, message });
};

const formatCompanyName = (hostname: string) => {
  const segments = hostname
    .replace(/^www\./i, "")
    .split(".")
    .filter(Boolean);
  const base = segments[0] ?? hostname;

  return base
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeResults = (
  results: Awaited<ReturnType<typeof searchCompanyNews>>,
  type: NormalizedSource["type"],
  startIndex: number,
): NormalizedSource[] =>
  results.map((result, i) => ({
    id: `src_${String(startIndex + i).padStart(3, "0")}`,
    type,
    title: result.title,
    url: result.url,
    snippet: result.content.slice(0, 300),
    score: result.score,
  }));

const buildSocialSummary = async (companyName: string) => {
  const socialScore = await getSocialScore(companyName);
  return {
    summary: JSON.stringify(
      {
        overallSentiment: socialScore.overallSentiment,
        sourcesChecked: socialScore.sourcesChecked,
        highlights: socialScore.highlights,
        hn: socialScore.hn,
        reddit: socialScore.reddit,
      },
      null,
      2,
    ),
    socialScore,
  };
};

export type DiligenceReportResult = {
  report: DiligenceReport;
  sources: NormalizedSource[];
};

export const generateDiligenceReport = async (
  input: GenerateDiligenceInput,
  onProgress?: DiligenceProgressCallback,
): Promise<DiligenceReportResult> => {
  try {
    const missingKeys = getMissingEnvKeys(["GOOGLE_GENAI_API_KEY"]);
    if (missingKeys.length > 0) {
      throw new Error("Google Gemini API key is required. Add GOOGLE_GENAI_API_KEY to .env.local");
    }

    await notify(onProgress, "normalize-input", "Normalizing company input.");

    const url = new URL(input.companyUrl);
    const companyName = input.companyName?.trim() || formatCompanyName(url.hostname);

    await notify(onProgress, "search-news", "Searching company news.");
    const newsResults = await searchCompanyNews(companyName, {
      maxResults: 8,
      depth: "advanced",
    });

    await notify(onProgress, "search-funding", "Searching funding history.");
    const fundingResults = await searchFunding(companyName, {
      maxResults: 6,
      depth: "advanced",
    });

    await notify(onProgress, "search-competitors", "Searching competitors.");
    const competitorResults = await searchCompetitors(companyName, {
      maxResults: 6,
      depth: "basic",
    });

    await notify(onProgress, "social-sentiment", "Analyzing social sentiment.");
    const { summary: socialSummary, socialScore } = await buildSocialSummary(companyName);

    // Build base sources from search results
    const baseSources: NormalizedSource[] = [
      ...normalizeResults(newsResults, "news", 1),
      ...normalizeResults(fundingResults, "funding", newsResults.length + 1),
      ...normalizeResults(
        competitorResults,
        "competitor",
        newsResults.length + fundingResults.length + 1,
      ),
    ];

    const hnSources: NormalizedSource[] = [];
    const hn = socialScore.hn;
    if (hn) {
      const hnStartIndex = baseSources.length + 1;
      hn.topStories.forEach((story, i) => {
        hnSources.push({
          id: `src_${String(hnStartIndex + i).padStart(3, "0")}`,
          type: "hn",
          title: `[HN] ${story.title}`,
          url: story.url ?? `https://news.ycombinator.com/item?id=${story.objectID}`,
          snippet: `${story.points} points, ${story.num_comments} comments`,
          score: story.points,
        });
      });
      const commentStartIndex = hnStartIndex + hn.topStories.length;
      hn.topComments.forEach((comment, i) => {
        hnSources.push({
          id: `src_${String(commentStartIndex + i).padStart(3, "0")}`,
          type: "hn",
          title: `[HN Comment] Re: ${comment.storyTitle || "Discussion"}`,
          url: `https://news.ycombinator.com/item?id=${comment.objectID}`,
          snippet: comment.text.slice(0, 300),
          score: null,
        });
      });
    }

    const allSources: NormalizedSource[] = [...baseSources, ...hnSources];

    const seenUrls = new Set<string>();
    const sources: NormalizedSource[] = [];
    allSources.forEach((source) => {
      const normalizedUrl = source.url.toLowerCase();
      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        sources.push({
          ...source,
          id: `src_${String(sources.length + 1).padStart(3, "0")}`,
        });
      }
    });

    await notify(onProgress, "analysis", "Generating diligence report.");
    const prompt = buildDiligencePrompt({
      companyName,
      companyUrl: url.toString(),
      sources,
      socialSummary,
    });

    const report = await generateJson(prompt, diligenceReportSchema);

    await notify(onProgress, "complete", "Diligence report generated.");
    return { report, sources };
  } catch (error) {
    await notify(onProgress, "error", "Diligence report generation failed.");
    if (error instanceof Error) {
      throw new Error(`Diligence report error: ${error.message}`);
    }
    throw new Error("Diligence report error.");
  }
};
