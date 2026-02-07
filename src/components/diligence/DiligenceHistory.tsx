"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryReport = {
  id: string;
  status: string;
  score?: number | null;
  createdAt?: string;
  completedAt?: string | null;
  error?: string | null;
  company?: {
    name?: string;
    url?: string;
  } | null;
};

type HistoryResponse = {
  reports: HistoryReport[];
};

const statusTone = (status: string) => {
  switch (status) {
    case "completed":
      return "text-emerald-500";
    case "failed":
      return "text-rose-500";
    case "processing":
      return "text-amber-500";
    default:
      return "text-vc-secondary";
  }
};

export const DiligenceHistory = () => {
  const router = useRouter();
  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadHistory = async () => {
      try {
        const response = await fetch("/api/diligence/history");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Unable to load history.");
        }

        const data = (await response.json()) as HistoryResponse;
        if (isActive) {
          setReports(data.reports ?? []);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load history.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return reports;
    }
    return reports.filter((report) => report.company?.name?.toLowerCase().includes(normalized));
  }, [reports, query]);

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
            Recent Reports
          </div>
          <p className="text-sm text-vc-tertiary mt-2">
            Track previous runs and open completed reports.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by company"
          className="w-full md:w-64 border border-vc-border bg-white px-3 py-2 text-xs text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="mt-6 border border-vc-border">
        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-vc-border px-4 py-3 text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          <div className="col-span-7">Company</div>
          <div className="col-span-3">Time</div>
          <div className="col-span-2">Status</div>
        </div>

        {isLoading ? (
          <div className="px-4 py-6 text-xs text-vc-secondary">Loading history...</div>
        ) : null}

        {error ? <div className="px-4 py-6 text-xs text-rose-500">{error}</div> : null}

        {!isLoading && !error && filteredReports.length === 0 ? (
          <div className="px-4 py-6 text-xs text-vc-secondary">No reports yet.</div>
        ) : null}

        {filteredReports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => router.push(`/diligence/${report.id}`)}
            className="flex flex-col gap-3 w-full text-left px-4 py-4 border-b border-vc-border hover:bg-vc-hover transition-colors md:grid md:grid-cols-12 md:gap-4"
          >
            <div className="md:col-span-7 text-sm text-vc-primary">
              {report.company?.name ?? "Unknown Company"}
              <div className="text-xs text-vc-secondary">{report.company?.url ?? ""}</div>
            </div>
            <div className="md:col-span-3 text-xs text-vc-secondary">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-vc-secondary md:hidden">
                Time
              </div>
              <div>
                {report.completedAt
                  ? new Date(report.completedAt).toLocaleString()
                  : report.createdAt
                    ? new Date(report.createdAt).toLocaleString()
                    : "-"}
              </div>
            </div>
            <div className="md:col-span-2 text-xs font-mono uppercase tracking-[0.2em]">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-vc-secondary md:hidden">
                Status
              </div>
              <div className={`${statusTone(report.status)}`}>{report.status}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
