import type { Exporter, Exportable, ExportKind, ExportFormat, ExportArtifact } from "./types";
import { markdownExporter } from "./exporters/markdownExporter";
import { dashboardExportable } from "./exportables/dashboardExportable";
import { diligenceExportable } from "./exportables/diligenceExportable";

type ExportableRegistry = {
  [K in ExportKind]?: Exportable<unknown>;
};

type ExporterRegistry = {
  [K in ExportFormat]?: Exporter;
};

const defaultExporters: ExporterRegistry = {
  markdown: markdownExporter,
};

const defaultExportables: ExportableRegistry = {
  companyReport: dashboardExportable as Exportable<unknown>,
  diligenceReport: diligenceExportable as Exportable<unknown>,
};

export class ExportService {
  private exportables: ExportableRegistry;
  private exporters: ExporterRegistry;

  constructor(
    exportables: ExportableRegistry = defaultExportables,
    exporters: ExporterRegistry = defaultExporters,
  ) {
    this.exportables = exportables;
    this.exporters = exporters;
  }

  registerExportable<T>(exportable: Exportable<T>): void {
    this.exportables[exportable.kind] = exportable as Exportable<unknown>;
  }

  registerExporter(exporter: Exporter): void {
    this.exporters[exporter.format] = exporter;
  }

  async export<T>(args: {
    kind: ExportKind;
    format: ExportFormat;
    payload: T;
  }): Promise<ExportArtifact> {
    const exportable = this.exportables[args.kind];
    if (!exportable) {
      throw new Error(`No exportable registered for kind: ${args.kind}`);
    }

    const exporter = this.exporters[args.format];
    if (!exporter) {
      throw new Error(`No exporter registered for format: ${args.format}`);
    }

    const doc = await exportable.buildDocument(args.payload);
    return exporter.export(doc);
  }

  getSupportedFormats(): ExportFormat[] {
    return Object.keys(this.exporters) as ExportFormat[];
  }
}

export const exportService = new ExportService();
