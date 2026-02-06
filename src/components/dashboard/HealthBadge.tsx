import type { AlertSeverity } from "@/src/lib/dashboard/types";

interface HealthBadgeProps {
  severity: AlertSeverity | "healthy";
  label?: string;
}

const config: Record<string, { color: string; text: string }> = {
  healthy: { color: "bg-emerald-500", text: "Healthy" },
  info: { color: "bg-blue-400", text: "Info" },
  warning: { color: "bg-amber-500", text: "At Risk" },
  critical: { color: "bg-rose-500", text: "Critical" },
};

export const HealthBadge = ({ severity, label }: HealthBadgeProps) => {
  const c = config[severity] ?? config.healthy;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 ${c.color} flex-shrink-0`} />
      <span className="text-xs font-mono text-vc-secondary">{label ?? c.text}</span>
    </span>
  );
};
