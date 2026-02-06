"use client";

import { useState, useRef, useEffect } from "react";

export type SourceInfo = {
  id: string;
  url: string;
  title: string;
  type: string;
  snippet?: string;
  ordinal: number;
};

type InlineCitationProps = {
  ordinal: number;
  source: SourceInfo;
};

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    news: "News",
    funding: "Funding",
    competitor: "Competitor",
    hn: "Hacker News",
    reddit: "Reddit",
    website: "Website",
  };
  return labels[type] ?? type;
};

export const InlineCitation = ({ ordinal, source }: InlineCitationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPosition(spaceBelow < 200 && spaceAbove > spaceBelow ? "above" : "below");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <span className="relative inline-block align-baseline">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center justify-center text-[10px] font-mono text-vc-secondary hover:text-vc-primary transition-colors cursor-pointer ml-0.5 align-super"
        aria-describedby={`citation-${ordinal}`}
      >
        [{ordinal}]
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          id={`citation-${ordinal}`}
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute z-50 w-72 bg-white border border-vc-border shadow-lg p-4 ${
            position === "above" ? "bottom-full mb-2" : "top-full mt-2"
          } left-1/2 -translate-x-1/2`}
        >
          <div
            className={`absolute w-3 h-3 bg-white border-vc-border rotate-45 left-1/2 -translate-x-1/2 ${
              position === "above"
                ? "bottom-[-7px] border-b border-r"
                : "top-[-7px] border-t border-l"
            }`}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-vc-secondary px-1.5 py-0.5 bg-vc-hover border border-vc-border">
                {getTypeLabel(source.type)}
              </span>
              <span className="text-[10px] font-mono text-vc-secondary">[{ordinal}]</span>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-vc-primary hover:underline leading-snug mb-1.5 line-clamp-2"
            >
              {source.title || getDomain(source.url)}
            </a>

            <div className="text-[11px] text-vc-secondary truncate">{getDomain(source.url)}</div>

            {source.snippet && (
              <div className="mt-2 text-xs text-vc-tertiary leading-relaxed line-clamp-3 border-t border-vc-border pt-2">
                {source.snippet}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
};
