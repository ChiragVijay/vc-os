"use client";

import { useState } from "react";
import type { SourceInfo } from "./InlineCitation";
import { getDomain, getTypeLabel } from "@/src/lib/diligence/sourceUtils";

type SourcesIndexProps = {
  sources: SourceInfo[];
};

export const SourcesIndex = ({ sources }: SourcesIndexProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-vc-border pt-8">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full text-left group cursor-pointer"
      >
        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary group-hover:text-vc-primary transition-colors">
          Sources ({sources.length})
        </h3>
        <div className="flex-1 h-px bg-vc-border" />
        <span
          className={`text-vc-secondary group-hover:text-vc-primary transition-all ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-6 space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="flex items-start gap-4 group">
              <span className="text-[11px] font-mono text-vc-secondary w-6 shrink-0 pt-0.5">
                [{source.ordinal}]
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-vc-secondary px-1.5 py-0.5 bg-vc-hover border border-vc-border">
                    {getTypeLabel(source.type)}
                  </span>
                  <span className="text-[11px] text-vc-secondary truncate">
                    {getDomain(source.url)}
                  </span>
                </div>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-vc-primary hover:underline leading-snug line-clamp-1"
                >
                  {source.title || getDomain(source.url)}
                </a>

                {source.snippet && (
                  <p className="mt-1 text-xs text-vc-tertiary leading-relaxed line-clamp-2">
                    {source.snippet}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
