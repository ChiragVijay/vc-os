import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  value: number; // positive = up, negative = down, ~0 = flat
  invert?: boolean; // if true, down is good (e.g., churn)
  showValue?: boolean;
}

export const TrendIndicator = ({
  value,
  invert = false,
  showValue = true,
}: TrendIndicatorProps) => {
  const isUp = value > 0.5;
  const isDown = value < -0.5;

  const isGood = invert ? isDown : isUp;
  const isBad = invert ? isUp : isDown;

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = isGood
    ? "text-emerald-600"
    : isBad
      ? "text-rose-500"
      : "text-vc-secondary";

  return (
    <span className={`inline-flex items-center gap-0.5 ${color}`}>
      <Icon className="w-3 h-3" />
      {showValue && (
        <span className="text-xs font-mono">
          {value >= 0 ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      )}
    </span>
  );
};
