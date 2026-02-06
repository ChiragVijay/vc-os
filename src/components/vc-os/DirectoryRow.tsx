import { ArrowUpRight } from "lucide-react";

interface DirectoryRowProps {
  id: string;
  name: string;
  desc: string;
  onClick: () => void;
}

export const DirectoryRow = ({ id, name, desc, onClick }: DirectoryRowProps) => (
  <div
    onClick={onClick}
    className="group flex flex-col md:flex-row md:items-baseline py-6 border-b border-vc-border cursor-pointer hover:bg-vc-hover transition-colors gap-2 md:gap-0"
  >
    <div className="w-16 font-mono text-xs tracking-tight text-vc-secondary">({id})</div>
    <div className="flex-1">
      <h3 className="text-xl font-medium text-vc-primary group-hover:text-accent transition-colors flex items-center gap-2">
        {name}
        <ArrowUpRight
          size={14}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-accent"
        />
      </h3>
    </div>
    <div className="flex-1 text-sm text-vc-tertiary font-light">{desc}</div>
  </div>
);
