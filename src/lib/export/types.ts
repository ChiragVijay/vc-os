export type ExportCitation = { sourceId: string };
export type ExportInline = { text: string; citations?: ExportCitation[] };

export type ExportBlock =
  | { type: "paragraph"; content: ExportInline }
  | { type: "bullets"; items: ExportInline[] }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "keyValue"; key: string; value: string }
  | { type: "divider" };

export type ExportSource = {
  id: string;
  ordinal?: number;
  title: string;
  url: string;
  snippet?: string;
  type?: string;
};

export type ExportDocument = {
  title: string;
  subtitle?: string;
  meta?: Record<string, string>;
  blocks: ExportBlock[];
  sources?: ExportSource[];
  fileBaseName: string;
};

export type ExportFormat = "markdown" | "pdf";

export type ExportArtifact = {
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  data: string | Uint8Array;
};

export interface Exporter {
  format: ExportFormat;
  export(doc: ExportDocument): Promise<ExportArtifact>;
}

export type ExportKind = "diligenceReport" | "companyReport";

export interface Exportable<TPayload> {
  kind: ExportKind;
  buildDocument(payload: TPayload): Promise<ExportDocument> | ExportDocument;
}
