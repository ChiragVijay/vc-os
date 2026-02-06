import { PRE_DEAL_TOOLS, FOUNDER_TOOLS, POST_DEAL_TOOLS } from "@/src/lib/homeData";
import { DirectoryRow } from "./DirectoryRow";
import { AppHeader } from "@/src/components/ui";

interface HomeProps {
  onEnterApp?: () => void;
  onSelectTool?: (toolId: string) => void;
}

interface ToolPhase {
  label: string;
  tools: typeof PRE_DEAL_TOOLS;
}

const PHASES: ToolPhase[] = [
  { label: "Phase_01: Pre-Deal Intelligence", tools: PRE_DEAL_TOOLS },
  { label: "Phase_02: Post-Deal Operations", tools: POST_DEAL_TOOLS },
  { label: "Phase_03: Founder Tools", tools: FOUNDER_TOOLS },
];

export const Home: React.FC<HomeProps> = ({ onSelectTool }) => {
  return (
    <div className="min-h-screen bg-white text-vc-primary font-sans selection:bg-accent selection:text-white">
      <AppHeader showNav={false} />

      <main className="px-6 pt-24 pb-32 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-light leading-[1.2] mb-3">
            Navigate investments <br />
            <span className="text-vc-secondary">with intelligence.</span>
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-vc-tertiary">
            Explore tools designed to accelerate the decision making process.
          </p>
        </div>

        <div className="w-full">
          <div className="flex pb-2 border-b border-black mb-0">
            <span className="font-mono text-xs tracking-tight w-16">ID</span>
            <span className="font-mono text-xs tracking-tight flex-1">TOOL</span>
            <span className="font-mono text-xs tracking-tight flex-1">FUNCTION</span>
          </div>

          {PHASES.map((phase, index) => (
            <div key={phase.label}>
              <div className={`${index === 0 ? "py-4" : "pt-12 pb-4"}`}>
                <span className="font-mono text-xs tracking-tight text-vc-secondary uppercase tracking-wider">
                  {phase.label}
                </span>
              </div>
              <div className={index > 0 ? "border-t border-vc-border" : ""}>
                {phase.tools.map((tool) => (
                  <DirectoryRow
                    key={tool.id}
                    {...tool}
                    onClick={() => onSelectTool?.(tool.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
