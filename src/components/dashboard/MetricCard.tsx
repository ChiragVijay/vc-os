import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  invertDelta?: boolean; // true = negative is good (e.g., churn going down)
  compact?: boolean;
}

export const MetricCard = ({
  label,
  value,
  delta,
  deltaLabel,
  invertDelta = false,
  compact = false,
}: MetricCardProps) => {
  const isPositive = delta !== null && delta !== undefined && delta > 0;
  const isNegative = delta !== null && delta !== undefined && delta < 0;
  const isGood = invertDelta ? isNegative : isPositive;
  const isBad = invertDelta ? isPositive : isNegative;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isGood
    ? "text-emerald-600"
    : isBad
      ? "text-rose-500"
      : "text-vc-secondary";

  return (
    <div
      className={`border border-vc-border ${compact ? "px-3 py-3" : "px-4 py-5"} bg-white`}
    >
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-2">
        {label}
      </div>
      <div
        className={`${compact ? "text-xl" : "text-2xl"} font-light text-vc-primary leading-none mb-1`}
      >
        {value}
      </div>
      {delta !== null && delta !== undefined && (
        <div className={`flex items-center gap-1 ${trendColor} text-xs font-mono`}>
          <TrendIcon className="w-3 h-3" />
          <span>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          {deltaLabel && (
            <span className="text-vc-secondary ml-1">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
