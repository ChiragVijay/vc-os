"use client";

import { DiligenceHistory } from "@/src/components/diligence/DiligenceHistory";
import { DiligenceInput } from "@/src/components/diligence/DiligenceInput";

export default function DiligencePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="border-b border-vc-border pb-10">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          Diligence Agent
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-serif font-light">
          Run a rapid diligence scan.
        </h1>
        <p className="mt-3 text-sm text-vc-tertiary max-w-xl">
          Provide a startup URL and the tool will orchestrate search, social, and market signals
          into a structured venture memo.
        </p>
      </header>

      <div className="mt-10">
        <DiligenceInput />
      </div>
      <DiligenceHistory />
    </div>
  );
}
