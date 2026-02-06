import type { Exporter, ExportDocument, ExportArtifact } from "../types";
import { buildFileName } from "../utils/filenames";
import { buildCitationMap, formatInlineWithCitations, formatFootnotes } from "../utils/citations";

export const markdownExporter: Exporter = {
  format: "markdown",

  async export(doc: ExportDocument): Promise<ExportArtifact> {
    const citationMap = buildCitationMap(doc.sources ?? []);
    const lines: string[] = [];

    lines.push(`# ${doc.title}`);
    if (doc.subtitle) {
      lines.push(`*${doc.subtitle}*`);
    }
    lines.push("");

    if (doc.meta && Object.keys(doc.meta).length > 0) {
      for (const [key, value] of Object.entries(doc.meta)) {
        lines.push(`**${key}:** ${value}`);
      }
      lines.push("");
    }

    for (const block of doc.blocks) {
      switch (block.type) {
        case "heading":
          lines.push(`${"#".repeat(block.level)} ${block.text}`);
          lines.push("");
          break;

        case "paragraph":
          lines.push(formatInlineWithCitations(block.content, citationMap));
          lines.push("");
          break;

        case "bullets":
          for (const item of block.items) {
            lines.push(`- ${formatInlineWithCitations(item, citationMap)}`);
          }
          lines.push("");
          break;

        case "keyValue":
          lines.push(`**${block.key}:** ${block.value}`);
          lines.push("");
          break;

        case "divider":
          lines.push("---");
          lines.push("");
          break;
      }
    }

    if (doc.sources && doc.sources.length > 0) {
      lines.push("---");
      lines.push("");
      lines.push("## Sources");
      lines.push("");
      lines.push(formatFootnotes(doc.sources, citationMap));
    }

    const content = lines.join("\n");
    const fileName = buildFileName(doc.fileBaseName, "md");

    return {
      format: "markdown",
      fileName,
      mimeType: "text/markdown",
      data: content,
    };
  },
};
