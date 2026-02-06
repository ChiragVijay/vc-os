import { DiligenceHistory } from "@/src/components/diligence/DiligenceHistory";
import { DiligenceInput } from "@/src/components/diligence/DiligenceInput";
import { SectionHeader } from "@/src/components/ui";

export default function DiligencePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeader
        eyebrow="Diligence Agent"
        title="Run a rapid diligence scan."
        description="Provide a startup URL and the tool will orchestrate search, social, and market signals into a structured venture memo."
      />

      <div className="mt-10">
        <DiligenceInput />
      </div>
      <DiligenceHistory />
    </div>
  );
}
