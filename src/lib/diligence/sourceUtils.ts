/**
 * Shared source-related utilities for diligence components.
 * Eliminates duplication between InlineCitation and SourcesIndex.
 */

/** Extract the domain from a URL, stripping www. prefix. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  news: "News",
  funding: "Funding",
  competitor: "Competitor",
  hn: "Hacker News",
  reddit: "Reddit",
  website: "Website",
};

/** Get a human-readable label for a source type. */
export function getTypeLabel(type: string): string {
  return SOURCE_TYPE_LABELS[type] ?? type;
}
