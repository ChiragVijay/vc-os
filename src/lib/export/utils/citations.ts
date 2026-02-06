import type { ExportSource, ExportInline, ExportCitation } from "../types";

export type CitationMap = Map<string, number>;

export const buildCitationMap = (sources: ExportSource[]): CitationMap => {
  const map = new Map<string, number>();
  sources.forEach((source, index) => {
    map.set(source.id, source.ordinal ?? index + 1);
  });
  return map;
};

export const formatInlineWithCitations = (
  inline: ExportInline,
  citationMap: CitationMap,
): string => {
  const { text, citations } = inline;
  if (!citations || citations.length === 0) {
    return text;
  }

  const ordinals = citations
    .map((c) => citationMap.get(c.sourceId))
    .filter((n): n is number => n !== undefined)
    .sort((a, b) => a - b);

  if (ordinals.length === 0) {
    return text;
  }

  const refs = ordinals.map((n) => `[^${n}]`).join("");
  return `${text}${refs}`;
};

export const formatFootnotes = (sources: ExportSource[], citationMap: CitationMap): string => {
  const sortedSources = [...sources].sort((a, b) => {
    const ordA = citationMap.get(a.id) ?? 999;
    const ordB = citationMap.get(b.id) ?? 999;
    return ordA - ordB;
  });

  return sortedSources
    .map((source) => {
      const ordinal = citationMap.get(source.id) ?? 0;
      return `[^${ordinal}]: ${source.title} — ${source.url}`;
    })
    .join("\n");
};
