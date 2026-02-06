"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProgressInfo = {
  stage?: string;
  message?: string;
  updatedAt?: string;
};

type StatusResponse = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string | null;
  completedAt?: string | null;
  progress?: ProgressInfo | null;
};

const processingSteps = [
  "Normalizing inputs",
  "Scanning for funding signals",
  "Mapping competitor landscape",
  "Listening to social chatter",
  "Drafting diligence narrative",
];

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { error: "Enter a valid company URL." };
  }

  if (!trimmed.includes(".") && !/^https?:\/\//i.test(trimmed)) {
    return { error: "Please enter a full domain (e.g., google.com)." };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const urlObj = new URL(withProtocol);
    if (!urlObj.hostname.includes(".")) {
      return { error: "Please enter a valid domain with a TLD (e.g., .com)." };
    }
    return { url: urlObj.toString() };
  } catch {
    return { error: "Enter a valid company URL." };
  }
};

export const DiligenceInput = () => {
  const router = useRouter();
  const [companyUrl, setCompanyUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "failed" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [confirmState, setConfirmState] = useState<{
    url: string;
    visible: boolean;
  } | null>(null);

  const animatedMessage = useMemo(
    () => processingSteps[stepIndex % processingSteps.length],
    [stepIndex],
  );

  useEffect(() => {
    if (status !== "processing") {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((prev) => prev + 1);
    }, 1600);

    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (!reportId || status !== "processing") {
      return;
    }

    let isActive = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/diligence/${reportId}/status`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as StatusResponse;
        if (!isActive) {
          return;
        }

        setProgress(data.progress ?? null);

        if (data.status === "completed") {
          setStatus("completed");
          router.push(`/diligence/${reportId}`);
        }

        if (data.status === "failed") {
          setStatus("failed");
          setError(data.error ?? "Report generation failed.");
        }
      } catch (pollError) {
        if (!isActive) {
          return;
        }
        setError("Unable to fetch report status.");
      }
    };

    poll();
    const interval = window.setInterval(poll, 3000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [reportId, status, router]);

  const startAnalysis = async (url: string, force: boolean) => {
    const response = await fetch("/api/diligence/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyUrl: url, force }),
    });

    if (response.status === 409) {
      const data = await response.json();
      return { conflict: true, message: data?.error ?? "Report exists." };
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error ?? "Failed to start analysis.");
    }

    const data = (await response.json()) as { reportId: string };
    return { reportId: data.reportId };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeUrl(companyUrl);
    if (normalized.error || !normalized.url) {
      setStatus("failed");
      setError(normalized.error ?? "Enter a valid company URL.");
      return;
    }

    setError(null);

    try {
      const initial = await startAnalysis(normalized.url, false);
      if ("conflict" in initial && initial.conflict) {
        setConfirmState({ url: normalized.url, visible: true });
        return;
      }

      if ("reportId" in initial && initial.reportId) {
        setReportId(initial.reportId);
      }

      setStatus("processing");
      setProgress({ stage: "queue", message: "Queuing analysis." });
    } catch (submitError) {
      setStatus("failed");
      setError(submitError instanceof Error ? submitError.message : "Failed to start analysis.");
    }
  };

  const statusMessage = progress?.message ?? animatedMessage;
  const statusStage = status === "idle" ? "idle" : (progress?.stage ?? "processing");

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={companyUrl}
            onChange={(event) => setCompanyUrl(event.target.value)}
            placeholder="company.com or https://company.com"
            className="w-full border border-vc-border bg-white px-4 py-3 text-sm text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40"
            disabled={status === "processing"}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-vc-secondary">
            URL
          </span>
        </div>
        <button
          type="submit"
          disabled={status === "processing"}
          className="md:w-48 border border-vc-primary bg-vc-primary text-white text-xs font-mono tracking-[0.2em] uppercase py-3 transition-colors hover:bg-accent hover:border-accent disabled:opacity-60"
        >
          {status === "processing" ? "Analyzing" : "Run Analysis"}
        </button>
      </form>

      <div className="flex flex-wrap gap-3 text-[11px] uppercase font-mono tracking-[0.2em] text-vc-secondary mt-4">
        <span>Reddit</span>
        <span>Hacker News</span>
        <span>Tavily</span>
        <span>Brave</span>
        <span>Gemini</span>
      </div>

      <div className="mt-6 border border-vc-border bg-vc-hover/70 px-4 py-4">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary">
          <span>Status</span>
          <span className="text-vc-primary">{statusStage}</span>
        </div>
        <div className="mt-3 text-sm text-vc-primary flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="transition-opacity duration-300">
            {status === "idle"
              ? "Awaiting company URL."
              : status === "failed"
                ? (error ?? "Something went wrong.")
                : statusMessage}
          </span>
        </div>
        {error && status === "failed" ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      </div>

      {confirmState?.visible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md border border-vc-border bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary">
              Existing Report
            </div>
            <h2 className="mt-3 text-lg font-semibold text-vc-primary">
              Overwrite the latest analysis?
            </h2>
            <p className="mt-3 text-sm text-vc-tertiary">
              A report already exists for this company. Running analysis again will overwrite the
              stored report for this URL.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="flex-1 border border-vc-border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary hover:text-vc-primary hover:border-vc-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirmState?.url) {
                    setConfirmState(null);
                    return;
                  }

                  setConfirmState(null);
                  setStatus("processing");
                  setProgress({ stage: "queue", message: "Queuing analysis." });

                  try {
                    const retry = await startAnalysis(confirmState.url, true);
                    if ("reportId" in retry && retry.reportId) {
                      setReportId(retry.reportId);
                    }
                  } catch (submitError) {
                    setStatus("failed");
                    setError(
                      submitError instanceof Error
                        ? submitError.message
                        : "Failed to start analysis.",
                    );
                  }
                }}
                className="flex-1 border border-vc-primary bg-vc-primary px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-white hover:bg-accent hover:border-accent transition-colors"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
