"use client";

import { InlineCitation, type SourceInfo } from "./InlineCitation";
import { SourcesIndex } from "./SourcesIndex";
import { ExportButton } from "@/src/components/export";
import { useDiligenceExport } from "./useDiligenceExport";

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
    reasoning?: string;
  };
};

type ReportDetails = {
  id: string;
  status: string;
  score?: number | null;
  sourcesUsed?: string[];
  createdAt?: string;
  completedAt?: string | null;
  error?: string | null;
  company?: {
    name?: string;
    url?: string;
  } | null;
  report?: DiligenceReportData | null;
  sources?: SourceInfo[];
};

const isCitedText = (item: string | CitedText): item is CitedText => {
  return typeof item === "object" && item !== null && "text" in item;
};

const getText = (item: string | CitedText): string => {
  return isCitedText(item) ? item.text : item;
};

const getCitations = (item: string | CitedText): string[] => {
  return isCitedText(item) ? (item.citations ?? []) : [];
};

type CitedContentProps = {
  content: string | CitedText;
  sourceMap: Map<string, SourceInfo>;
  className?: string;
  as?: "p" | "span" | "div";
};

const CitedContent = ({
  content,
  sourceMap,
  className = "",
  as: Tag = "span",
}: CitedContentProps) => {
  const text = getText(content);
  const citations = getCitations(content);

  const uniqueCitations = [...new Set(citations)]
    .map((id) => sourceMap.get(id))
    .filter((s): s is SourceInfo => s !== undefined)
    .sort((a, b) => a.ordinal - b.ordinal);

  return (
    <Tag className={className}>
      {text}
      {uniqueCitations.map((source) => (
        <InlineCitation key={source.id} ordinal={source.ordinal} source={source} />
      ))}
    </Tag>
  );
};

type ListSectionProps = {
  items: (string | CitedText)[];
  sourceMap: Map<string, SourceInfo>;
  className?: string;
};

const ListSection = ({ items, sourceMap, className = "" }: ListSectionProps) => (
  <ul className={`space-y-3 ${className}`}>
    {items.map((item, i) => (
      <li key={i} className="text-base text-vc-primary leading-relaxed flex items-start gap-3">
        <span className="mt-2 block w-1.5 h-1.5 rounded-full bg-vc-border shrink-0" />
        <CitedContent content={item} sourceMap={sourceMap} />
      </li>
    ))}
  </ul>
);

export const DiligenceReport = ({ report }: { report: ReportDetails }) => {
  const data = report.report ?? {};
  const sources = report.sources ?? [];
  const exportOptions = useDiligenceExport(report);

  const sourceMap = new Map<string, SourceInfo>(sources.map((s) => [s.id, s]));

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-white text-vc-primary font-sans selection:bg-vc-border selection:text-vc-primary">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-primary border border-vc-primary px-2 py-1">
                Due Diligence Report
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
                {formattedDate}
              </span>
            </div>
            <ExportButton options={exportOptions} className="no-print" />
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-vc-primary leading-[1.1]">
            {report.company?.name ?? "Company"}
          </h1>
          <div className="mt-4">
            <a
              href={report.company?.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg text-vc-secondary border-b border-vc-border hover:text-vc-primary hover:border-vc-primary transition-all pb-0.5"
            >
              {report.company?.url?.replace(/^https?:\/\//, "")}
            </a>
          </div>

          {/* Investment Thesis - Primary */}
          {data.investmentThesis?.summary && (
            <div className="mt-12">
              <div className="p-10 border-2 border-vc-primary bg-gradient-to-br from-white to-vc-hover/20">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-primary border border-vc-primary px-2 py-1">
                    Investment Thesis
                  </span>
                  <span
                    className={`text-xs font-mono uppercase tracking-[0.2em] px-2 py-1 ${
                      data.socialSentiment?.overallSentiment?.toLowerCase().includes("positive")
                        ? "border-emerald-600 text-emerald-600"
                        : data.socialSentiment?.overallSentiment?.toLowerCase().includes("negative")
                          ? "border-rose-600 text-rose-600"
                          : "border-amber-600 text-amber-600"
                    } border`}
                  >
                    {data.socialSentiment?.overallSentiment ?? "Unknown"} Sentiment
                  </span>
                </div>
                <CitedContent
                  content={data.investmentThesis.summary}
                  sourceMap={sourceMap}
                  as="div"
                  className="text-xl md:text-2xl leading-relaxed text-vc-primary font-light"
                />
              </div>
            </div>
          )}
        </header>

        <div className="space-y-24">
          {/* Executive Summary */}
          {data.executiveSummary && (
            <section>
              <h2 className="text-3xl font-serif font-medium text-vc-primary mb-8 pb-4 border-b border-vc-border">
                Executive Summary
              </h2>
              <div className="grid md:grid-cols-12 gap-10">
                <div className="md:col-span-8">
                  {data.executiveSummary.overview && (
                    <CitedContent
                      content={data.executiveSummary.overview}
                      sourceMap={sourceMap}
                      as="div"
                      className="text-lg leading-relaxed text-vc-primary/90 mb-10 font-light"
                    />
                  )}
                  {data.executiveSummary.keyFindings?.length ? (
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-5">
                        Key Findings
                      </h3>
                      <ListSection
                        items={data.executiveSummary.keyFindings}
                        sourceMap={sourceMap}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="md:col-span-4 pl-0 md:pl-8 md:border-l border-vc-border">
                  {data.executiveSummary.risks?.length ? (
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-5 text-rose-600">
                        Primary Risks
                      </h3>
                      <ul className="space-y-3">
                        {data.executiveSummary.risks.map((item, i) => (
                          <li key={i} className="text-sm text-vc-primary leading-relaxed">
                            <CitedContent content={item} sourceMap={sourceMap} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          )}

          {/* Market Analysis */}
          {data.marketAnalysis && (
            <section>
              <h2 className="text-3xl font-serif font-medium text-vc-primary mb-8 pb-4 border-b border-vc-border">
                Market Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-12 mb-10">
                {(data.marketAnalysis.tam || data.marketAnalysis.marketGrowth) && (
                  <div className="bg-vc-hover p-8 border border-vc-border">
                    {data.marketAnalysis.tam && (
                      <div className="mb-6 last:mb-0">
                        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
                          TAM
                        </p>
                        <p className="text-xl font-medium">
                          <CitedContent content={data.marketAnalysis.tam} sourceMap={sourceMap} />
                        </p>
                      </div>
                    )}
                    {data.marketAnalysis.marketGrowth && (
                      <div className="mb-0">
                        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
                          CAGR / Growth
                        </p>
                        <p className="text-xl font-medium">
                          <CitedContent
                            content={data.marketAnalysis.marketGrowth}
                            sourceMap={sourceMap}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  {data.marketAnalysis.customerSegments?.length ? (
                    <div className="mb-8">
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                        Target Segments
                      </h3>
                      <ListSection
                        items={data.marketAnalysis.customerSegments}
                        sourceMap={sourceMap}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {data.marketAnalysis.competition?.length ? (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                    Competitive Landscape
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.marketAnalysis.competition.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 border border-vc-border bg-vc-hover/30 hover:border-vc-primary/30 transition-colors"
                      >
                        <div className="text-sm text-vc-primary leading-relaxed">
                          <CitedContent content={item} sourceMap={sourceMap} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* Investment Thesis */}
          {data.investmentThesis && (
            <section>
              <h2 className="text-3xl font-serif font-medium text-vc-primary mb-8 pb-4 border-b border-vc-border">
                Investment Thesis
              </h2>
              {data.investmentThesis.summary && (
                <CitedContent
                  content={data.investmentThesis.summary}
                  sourceMap={sourceMap}
                  as="div"
                  className="text-lg leading-relaxed text-vc-primary/90 mb-10 font-light max-w-3xl"
                />
              )}
              <div className="grid md:grid-cols-2 gap-12">
                {data.investmentThesis.upside?.length ? (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full" /> Upside Case
                    </h3>
                    <ListSection items={data.investmentThesis.upside} sourceMap={sourceMap} />
                  </div>
                ) : null}
                {data.investmentThesis.concerns?.length ? (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-rose-600 mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-600 rounded-full" /> Critical Concerns
                    </h3>
                    <ListSection items={data.investmentThesis.concerns} sourceMap={sourceMap} />
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* SWOT Analysis */}
          {data.swotAnalysis && (
            <section>
              <h2 className="text-3xl font-serif font-medium text-vc-primary mb-8 pb-4 border-b border-vc-border">
                SWOT Analysis
              </h2>
              <div className="grid md:grid-cols-2 border border-vc-border divide-y md:divide-y-0 md:divide-x divide-vc-border">
                <div className="divide-y divide-vc-border">
                  <div className="p-8">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                      Strengths
                    </h3>
                    <ListSection items={data.swotAnalysis.strengths ?? []} sourceMap={sourceMap} />
                  </div>
                  <div className="p-8">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                      Weaknesses
                    </h3>
                    <ListSection items={data.swotAnalysis.weaknesses ?? []} sourceMap={sourceMap} />
                  </div>
                </div>
                <div className="divide-y divide-vc-border">
                  <div className="p-8">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                      Opportunities
                    </h3>
                    <ListSection
                      items={data.swotAnalysis.opportunities ?? []}
                      sourceMap={sourceMap}
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                      Threats
                    </h3>
                    <ListSection items={data.swotAnalysis.threats ?? []} sourceMap={sourceMap} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Social Sentiment */}
          {data.socialSentiment && (
            <section>
              <h2 className="text-3xl font-serif font-medium text-vc-primary mb-8 pb-4 border-b border-vc-border">
                Community Sentiment
              </h2>

              {/* Trend Badge */}
              {data.socialSentiment.mentionTrend &&
                data.socialSentiment.mentionTrend !== "unknown" && (
                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide border ${
                        data.socialSentiment.mentionTrend === "growing"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : data.socialSentiment.mentionTrend === "declining"
                            ? "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span>
                        {data.socialSentiment.mentionTrend === "growing"
                          ? "📈"
                          : data.socialSentiment.mentionTrend === "declining"
                            ? "📉"
                            : "➡️"}
                      </span>
                      {data.socialSentiment.mentionTrend} Buzz
                    </span>
                  </div>
                )}

              {/* Community Pulse - AI Summary */}
              {data.socialSentiment.communityPulse && (
                <div className="mb-10 p-6 bg-vc-hover border border-vc-border">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
                    Community Pulse
                  </p>
                  <p className="text-lg leading-relaxed text-vc-primary font-light italic">
                    {data.socialSentiment.communityPulse}
                  </p>
                </div>
              )}

              {/* Key Praises & Concerns Grid */}
              {(data.socialSentiment.keyPraises?.length ||
                data.socialSentiment.keyConcerns?.length) && (
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  {data.socialSentiment.keyPraises?.length ? (
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                        Community Praises
                      </h3>
                      <ListSection items={data.socialSentiment.keyPraises} sourceMap={sourceMap} />
                    </div>
                  ) : null}
                  {data.socialSentiment.keyConcerns?.length ? (
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-rose-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-600 rounded-full" />
                        Community Concerns
                      </h3>
                      <ListSection items={data.socialSentiment.keyConcerns} sourceMap={sourceMap} />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Hidden Gems */}
              {data.socialSentiment.hiddenGems?.length ? (
                <div className="mb-10">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-amber-600 mb-4 flex items-center gap-2">
                    <span>💎</span>
                    Hidden Gems
                  </h3>
                  <div className="grid gap-3">
                    {data.socialSentiment.hiddenGems.map((item, i) => (
                      <div key={i} className="p-4 border border-amber-200 bg-amber-50/30">
                        <span className="text-sm text-vc-primary leading-relaxed">
                          <CitedContent content={item} sourceMap={sourceMap} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Standard Highlights */}
              {data.socialSentiment.highlights?.length ? (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-4">
                    Discussion Highlights
                  </h3>
                  <ListSection items={data.socialSentiment.highlights} sourceMap={sourceMap} />
                </div>
              ) : null}
            </section>
          )}
        </div>

        {/* Sources Index */}
        <SourcesIndex sources={sources} />

        {/* Footer */}
        <footer className="mt-16 pt-10 border-t border-vc-border flex flex-col md:flex-row justify-between gap-6 text-[11px] font-mono uppercase tracking-[0.1em] text-vc-secondary">
          <div className="flex gap-4">
            <span>Generated by VC-OS</span>
          </div>
          <div className="flex gap-2 flex-wrap max-w-md justify-end">
            {(report.sourcesUsed ?? []).map((source) => (
              <span key={source} className="border border-vc-border px-2 py-1 bg-white">
                {source}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};
