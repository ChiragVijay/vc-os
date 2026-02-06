"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { DiligenceReport } from "@/src/components/diligence/DiligenceReport";

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
  report?: Record<string, unknown> | null;
};

export default function DiligenceReportPage() {
  const params = useParams();
  const reportId = params?.reportId as string | undefined;
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) {
      return;
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen text-vc-primary flex items-center justify-center">
        <div className="text-sm text-vc-secondary font-mono uppercase tracking-[0.2em]">
          Loading report...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen text-vc-primary flex items-center justify-center">
        <div className="text-sm text-red-500 font-mono uppercase tracking-[0.2em]">
          {error ?? "Report not found."}
        </div>
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="min-h-screen text-vc-primary flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-sm text-red-500 font-mono uppercase tracking-[0.2em] mb-4">
            Report Generation Failed
          </div>
          <p className="text-vc-secondary leading-relaxed">
            {report.error ?? "An unexpected error occurred while generating the report."}
          </p>
        </div>
      </div>
    );
  }

  return <DiligenceReport report={report} />;
}
