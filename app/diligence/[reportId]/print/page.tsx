"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

type ReportResponse = {
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

const isCitedText = (item: string | CitedText): item is CitedText =>
  typeof item === "object" && item !== null && "text" in item;

const getText = (item: string | CitedText): string => (isCitedText(item) ? item.text : item);

const getCitations = (item: string | CitedText): string[] =>
  isCitedText(item) ? (item.citations ?? []) : [];

const CitedText = ({
  content,
  sourceMap,
}: {
  content: string | CitedText;
  sourceMap: Map<string, SourceInfo>;
}) => {
  const text = getText(content);
  const citations = getCitations(content);

  const ordinals = [...new Set(citations)]
    .map((id) => sourceMap.get(id)?.ordinal)
    .filter((n): n is number => n !== undefined)
    .sort((a, b) => a - b);

  return (
    <span>
      {text}
      {ordinals.length > 0 && (
        <sup className="text-xs text-gray-500 ml-0.5">[{ordinals.join(",")}]</sup>
      )}
    </span>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="avoid-break mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{title}</h2>
    {children}
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">{title}</h3>
    {children}
  </div>
);

const BulletList = ({
  items,
  sourceMap,
}: {
  items: (string | CitedText)[];
  sourceMap: Map<string, SourceInfo>;
}) => (
  <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-800">
    {items.map((item, i) => (
      <li key={i}>
        <CitedText content={item} sourceMap={sourceMap} />
      </li>
    ))}
  </ul>
);

export default function DiligencePrintPage() {
  const params = useParams();
  const reportId = params?.reportId as string | undefined;
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;

    let isActive = true;
    const loadReport = async () => {
      try {
        const response = await fetch(`/api/diligence/${reportId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Unable to load report.");
        }
        const data = (await response.json()) as ReportResponse;
        if (isActive) {
          setReport(data);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load report.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadReport();
    return () => {
      isActive = false;
    };
  }, [reportId]);

  useEffect(() => {
    if (!isLoading && report && !error) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, report, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error ?? "Report not found."}</p>
      </div>
    );
  }

  const data = report.report ?? {};
  const sources = report.sources ?? [];
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 text-gray-900 bg-white print:px-0 print:py-0">
      <style jsx global>{`
        @media print {
          @page {
            margin: 16mm;
            size: A4;
          }
          .avoid-break {
            break-inside: avoid;
          }
          .page-break {
            break-before: page;
          }
        }
      `}</style>

      {/* Header */}
      <header className="mb-10 border-b-2 border-gray-900 pb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Due Diligence Report • {formattedDate}
        </p>
        <h1 className="text-4xl font-bold text-gray-900">{report.company?.name ?? "Company"}</h1>
        {report.company?.url && (
          <p className="text-sm text-gray-500 mt-1">
            {report.company.url.replace(/^https?:\/\//, "")}
          </p>
        )}

        {data.aiConfidenceScore?.reasoning && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Strategic Implications</h3>
            <p className="text-sm text-gray-800 leading-relaxed max-w-3xl">
              {data.aiConfidenceScore.reasoning}
            </p>
          </div>
        )}
      </header>

      {/* Executive Summary */}
      {data.executiveSummary && (
        <Section title="Executive Summary">
          {data.executiveSummary.overview && (
            <p className="text-sm text-gray-800 mb-4 leading-relaxed">
              <CitedText content={data.executiveSummary.overview} sourceMap={sourceMap} />
            </p>
          )}
          {data.executiveSummary.keyFindings?.length ? (
            <SubSection title="Key Findings">
              <BulletList items={data.executiveSummary.keyFindings} sourceMap={sourceMap} />
            </SubSection>
          ) : null}
          {data.executiveSummary.risks?.length ? (
            <SubSection title="Key Risks">
              <BulletList items={data.executiveSummary.risks} sourceMap={sourceMap} />
            </SubSection>
          ) : null}
        </Section>
      )}

      {/* Market Analysis */}
      {data.marketAnalysis && (
        <Section title="Market Analysis">
          {data.marketAnalysis.tam && (
            <SubSection title="Total Addressable Market">
              <p className="text-sm text-gray-800">
                <CitedText content={data.marketAnalysis.tam} sourceMap={sourceMap} />
              </p>
            </SubSection>
          )}
          {data.marketAnalysis.marketGrowth && (
            <SubSection title="Market Growth">
              <p className="text-sm text-gray-800">
                <CitedText content={data.marketAnalysis.marketGrowth} sourceMap={sourceMap} />
              </p>
            </SubSection>
          )}
          {data.marketAnalysis.customerSegments?.length ? (
            <SubSection title="Customer Segments">
              <BulletList items={data.marketAnalysis.customerSegments} sourceMap={sourceMap} />
            </SubSection>
          ) : null}
          {data.marketAnalysis.competition?.length ? (
            <SubSection title="Competitive Landscape">
              <BulletList items={data.marketAnalysis.competition} sourceMap={sourceMap} />
            </SubSection>
          ) : null}
        </Section>
      )}

      {/* Investment Thesis */}
      {data.investmentThesis && (
        <Section title="Investment Thesis">
          {data.investmentThesis.summary && (
            <p className="text-sm text-gray-800 mb-4 leading-relaxed">
              <CitedText content={data.investmentThesis.summary} sourceMap={sourceMap} />
            </p>
          )}
          <div className="grid grid-cols-2 gap-6">
            {data.investmentThesis.upside?.length ? (
              <SubSection title="Upside Case">
                <BulletList items={data.investmentThesis.upside} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
            {data.investmentThesis.concerns?.length ? (
              <SubSection title="Critical Concerns">
                <BulletList items={data.investmentThesis.concerns} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
          </div>
        </Section>
      )}

      {/* SWOT Analysis */}
      {data.swotAnalysis && (
        <Section title="SWOT Analysis">
          <div className="grid grid-cols-2 gap-6">
            {data.swotAnalysis.strengths?.length ? (
              <SubSection title="Strengths">
                <BulletList items={data.swotAnalysis.strengths} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
            {data.swotAnalysis.weaknesses?.length ? (
              <SubSection title="Weaknesses">
                <BulletList items={data.swotAnalysis.weaknesses} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
            {data.swotAnalysis.opportunities?.length ? (
              <SubSection title="Opportunities">
                <BulletList items={data.swotAnalysis.opportunities} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
            {data.swotAnalysis.threats?.length ? (
              <SubSection title="Threats">
                <BulletList items={data.swotAnalysis.threats} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
          </div>
        </Section>
      )}

      {/* Social Sentiment */}
      {data.socialSentiment && (
        <Section title="Community Sentiment">
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-700">Overall Sentiment: </span>
            <span className="text-sm text-gray-800">
              {data.socialSentiment.overallSentiment ?? "Unknown"}
            </span>
          </div>
          {data.socialSentiment.communityPulse && (
            <p className="text-sm text-gray-700 italic mb-4">
              "{data.socialSentiment.communityPulse}"
            </p>
          )}
          <div className="grid grid-cols-2 gap-6">
            {data.socialSentiment.keyPraises?.length ? (
              <SubSection title="Community Praises">
                <BulletList items={data.socialSentiment.keyPraises} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
            {data.socialSentiment.keyConcerns?.length ? (
              <SubSection title="Community Concerns">
                <BulletList items={data.socialSentiment.keyConcerns} sourceMap={sourceMap} />
              </SubSection>
            ) : null}
          </div>
        </Section>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <section className="page-break mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sources</h2>
          <ol className="text-xs text-gray-600 space-y-1">
            {sources
              .sort((a, b) => a.ordinal - b.ordinal)
              .map((source) => (
                <li key={source.id}>
                  <span className="font-mono">[{source.ordinal}]</span> {source.title} —{" "}
                  <span className="text-gray-400">{source.url}</span>
                </li>
              ))}
          </ol>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Generated by VC-OS
      </footer>
    </div>
  );
}
