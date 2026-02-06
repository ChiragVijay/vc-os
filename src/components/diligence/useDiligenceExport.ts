"use client";

import { useMemo } from "react";
import { FileText, Printer } from "lucide-react";
import { createElement } from "react";
import { ExportService, diligenceExportable, type DiligenceExportPayload } from "@/src/lib/export";
import { downloadBlob, type ExportOption } from "@/src/components/export";

type SourceInfo = {
  id: string;
  ordinal: number;
  type: string;
  title: string;
  url: string;
  snippet?: string;
};

type ReportDetails = {
  id: string;
  status: string;
  sourcesUsed?: string[];
  createdAt?: string;
  completedAt?: string | null;
  error?: string | null;
  company?: {
    name?: string;
    url?: string;
  } | null;
  report?: Record<string, unknown> | null;
  sources?: SourceInfo[];
};

export const useDiligenceExport = (report: ReportDetails): ExportOption[] => {
  return useMemo(() => {
    const exportService = new ExportService();
    exportService.registerExportable(diligenceExportable);

    const payload: DiligenceExportPayload = {
      id: report.id,
      company: report.company,
      report: report.report as DiligenceExportPayload["report"],
      sources: report.sources,
      createdAt: report.createdAt,
    };

    const handleMarkdownExport = async () => {
      const artifact = await exportService.export({
        kind: "diligenceReport",
        format: "markdown",
        payload,
      });

      const data =
        typeof artifact.data === "string" ? artifact.data : new Uint8Array(artifact.data);
      const blob = new Blob([data], { type: artifact.mimeType });
      downloadBlob(blob, artifact.fileName);
    };

    const handlePdfExport = () => {
      const printUrl = `/diligence/${report.id}/print`;
      window.open(printUrl, "_blank");
    };

    return [
      {
        id: "markdown",
        label: "Export Markdown",
        icon: createElement(FileText, { className: "w-4 h-4" }),
        onClick: handleMarkdownExport,
      },
      {
        id: "pdf",
        label: "Export PDF",
        icon: createElement(Printer, { className: "w-4 h-4" }),
        onClick: handlePdfExport,
      },
    ];
  }, [report]);
};
