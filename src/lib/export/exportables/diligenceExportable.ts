import type { Exportable, ExportDocument, ExportBlock, ExportInline, ExportSource } from "../types";
import { slugify, getDateStamp } from "../utils/filenames";

type CitedText = {
  text: string;
  citations?: string[];
};

type DiligenceReportData = {
  executiveSummary?: {
    overview?: string | CitedText;
    keyFindings?: (string | CitedText)[];
    risks?: (string | CitedText)[];
  };
  marketAnalysis?: {
    tam?: string | CitedText;
    marketGrowth?: string | CitedText;
    customerSegments?: (string | CitedText)[];
    competition?: (string | CitedText)[];
  };
  socialSentiment?: {
    overallSentiment?: string;
    communityPulse?: string;
    keyConcerns?: (string | CitedText)[];
    keyPraises?: (string | CitedText)[];
    hiddenGems?: (string | CitedText)[];
    highlights?: (string | CitedText)[];
    mentionTrend?: "growing" | "stable" | "declining" | "unknown";
  };
  swotAnalysis?: {
    strengths?: (string | CitedText)[];
    weaknesses?: (string | CitedText)[];
    opportunities?: (string | CitedText)[];
    threats?: (string | CitedText)[];
  };
  investmentThesis?: {
    summary?: string | CitedText;
    upside?: (string | CitedText)[];
    concerns?: (string | CitedText)[];
  };
  aiConfidenceScore?: {
    score?: number;
    reasoning?: string;
  };
};

type SourceInfo = {
  id: string;
  ordinal: number;
  type: string;
  title: string;
  url: string;
  snippet?: string;
};

export type DiligenceExportPayload = {
  id: string;
  company?: { name?: string; url?: string } | null;
  report?: DiligenceReportData | null;
  sources?: SourceInfo[];
  score?: number | null;
  createdAt?: string;
};

const isCitedText = (item: string | CitedText): item is CitedText =>
  typeof item === "object" && item !== null && "text" in item;

const toInline = (item: string | CitedText): ExportInline => {
  if (isCitedText(item)) {
    return {
      text: item.text,
      citations: item.citations?.map((id) => ({ sourceId: id })),
    };
  }
  return { text: item };
};

const toInlineArray = (items: (string | CitedText)[] | undefined): ExportInline[] =>
  (items ?? []).map(toInline);

const addSection = (
  blocks: ExportBlock[],
  title: string,
  items: (string | CitedText)[] | undefined,
  level: 2 | 3 = 3,
): void => {
  if (!items || items.length === 0) return;
  blocks.push({ type: "heading", level, text: title });
  blocks.push({ type: "bullets", items: toInlineArray(items) });
};

const addParagraphSection = (
  blocks: ExportBlock[],
  title: string,
  content: string | CitedText | undefined,
  level: 2 | 3 = 3,
): void => {
  if (!content) return;
  blocks.push({ type: "heading", level, text: title });
  blocks.push({ type: "paragraph", content: toInline(content) });
};

export const diligenceExportable: Exportable<DiligenceExportPayload> = {
  kind: "diligenceReport",

  buildDocument(payload: DiligenceExportPayload): ExportDocument {
    const { company, report, sources, score, createdAt } = payload;
    const data = report ?? {};

    const companyName = company?.name ?? "Company";
    const blocks: ExportBlock[] = [];

    if (data.aiConfidenceScore && data.aiConfidenceScore.reasoning) {
      blocks.push({
        type: "heading",
        level: 2,
        text: "Strategic Implications",
      });
      blocks.push({
        type: "paragraph",
        content: { text: data.aiConfidenceScore.reasoning },
      });
      blocks.push({ type: "divider" });
    }

    if (data.executiveSummary) {
      blocks.push({ type: "heading", level: 2, text: "Executive Summary" });
      addParagraphSection(blocks, "Overview", data.executiveSummary.overview);
      addSection(blocks, "Key Findings", data.executiveSummary.keyFindings);
      addSection(blocks, "Key Risks", data.executiveSummary.risks);
    }

    if (data.marketAnalysis) {
      blocks.push({ type: "heading", level: 2, text: "Market Analysis" });
      addParagraphSection(blocks, "Total Addressable Market", data.marketAnalysis.tam);
      addParagraphSection(blocks, "Market Growth", data.marketAnalysis.marketGrowth);
      addSection(blocks, "Customer Segments", data.marketAnalysis.customerSegments);
      addSection(blocks, "Competitive Landscape", data.marketAnalysis.competition);
    }

    if (data.investmentThesis) {
      blocks.push({ type: "heading", level: 2, text: "Investment Thesis" });
      addParagraphSection(blocks, "Summary", data.investmentThesis.summary);
      addSection(blocks, "Upside Case", data.investmentThesis.upside);
      addSection(blocks, "Critical Concerns", data.investmentThesis.concerns);
    }

    if (data.swotAnalysis) {
      blocks.push({ type: "heading", level: 2, text: "SWOT Analysis" });
      addSection(blocks, "Strengths", data.swotAnalysis.strengths);
      addSection(blocks, "Weaknesses", data.swotAnalysis.weaknesses);
      addSection(blocks, "Opportunities", data.swotAnalysis.opportunities);
      addSection(blocks, "Threats", data.swotAnalysis.threats);
    }

    if (data.socialSentiment) {
      blocks.push({ type: "heading", level: 2, text: "Community Sentiment" });
      if (data.socialSentiment.overallSentiment) {
        blocks.push({
          type: "keyValue",
          key: "Overall Sentiment",
          value: data.socialSentiment.overallSentiment,
        });
      }
      if (data.socialSentiment.mentionTrend && data.socialSentiment.mentionTrend !== "unknown") {
        blocks.push({
          type: "keyValue",
          key: "Mention Trend",
          value: data.socialSentiment.mentionTrend,
        });
      }
      if (data.socialSentiment.communityPulse) {
        blocks.push({
          type: "paragraph",
          content: { text: `"${data.socialSentiment.communityPulse}"` },
        });
      }
      addSection(blocks, "Community Praises", data.socialSentiment.keyPraises);
      addSection(blocks, "Community Concerns", data.socialSentiment.keyConcerns);
      addSection(blocks, "Hidden Gems", data.socialSentiment.hiddenGems);
      addSection(blocks, "Discussion Highlights", data.socialSentiment.highlights);
    }

    const exportSources: ExportSource[] = (sources ?? []).map((s) => ({
      id: s.id,
      ordinal: s.ordinal,
      title: s.title,
      url: s.url,
      snippet: s.snippet,
      type: s.type,
    }));

    const meta: Record<string, string> = {};
    if (createdAt) {
      meta["Generated"] = new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (company?.url) {
      meta["Website"] = company.url;
    }

    return {
      title: `${companyName} — Due Diligence Report`,
      subtitle: company?.url?.replace(/^https?:\/\//, ""),
      meta,
      blocks,
      sources: exportSources,
      fileBaseName: `${slugify(companyName)}-diligence-report`,
    };
  },
};
