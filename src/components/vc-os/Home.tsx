import { PRE_DEAL_TOOLS, FOUNDER_TOOLS, POST_DEAL_TOOLS } from "@/src/lib/homeData";
import { DirectoryRow } from "./DirectoryRow";

interface HomeProps {
  onEnterApp: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onEnterApp, onSelectTool }) => {
  return (
    <div className="min-h-screen bg-white text-vc-primary font-sans selection:bg-accent selection:text-white">
      {/* Top Bar - Strictly functional */}
      <header className="px-6 py-6 flex justify-between items-baseline border-b border-vc-border">
        <div className="text-sm font-bold tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 bg-accent"></span>
          VC_OS
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 pt-24 pb-32 max-w-7xl mx-auto">
        {/* Minimal Hero Text */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-light leading-[1.2] mb-3">
            Navigate investments <br />
            <span className="text-vc-secondary">with intelligence.</span>
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-vc-tertiary">
            Explore tools designed to accelerate the decision making process.
          </p>
        </div>

        {/* The Directory List */}
        <div className="w-full">
          {/* Header Row */}
          <div className="flex pb-2 border-b border-black mb-0">
            <span className="font-mono text-xs tracking-tight w-16">ID</span>
            <span className="font-mono text-xs tracking-tight flex-1">TOOL</span>
            <span className="font-mono text-xs tracking-tight flex-1">FUNCTION</span>
          </div>

          {/* Phase 1 Group */}
          <div className="py-4">
            <span className="font-mono text-xs tracking-tight text-vc-secondary uppercase tracking-wider">
              Phase_01: Pre-Deal Intelligence
            </span>
          </div>
          {PRE_DEAL_TOOLS.map((tool) => (
            <DirectoryRow key={tool.id} {...tool} onClick={() => onSelectTool?.(tool.id)} />
          ))}

          {/* Phase 2 Group */}
          <div className="pt-12 pb-4">
            <span className="font-mono text-xs tracking-tight text-vc-secondary uppercase tracking-wider">
              Phase_02: Post-Deal Operations
            </span>
          </div>
          <div className="border-t border-vc-border">
            {POST_DEAL_TOOLS.map((tool) => (
              <DirectoryRow key={tool.id} {...tool} onClick={() => onSelectTool?.(tool.id)} />
            ))}
          </div>

          {/* Phase 3 Group */}
          <div className="pt-12 pb-4">
            <span className="font-mono text-xs tracking-tight text-vc-secondary uppercase tracking-wider">
              Phase_03: Founder Tools
            </span>
          </div>
          <div className="border-t border-vc-border">
            {FOUNDER_TOOLS.map((tool) => (
              <DirectoryRow key={tool.id} {...tool} onClick={() => onSelectTool?.(tool.id)} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
