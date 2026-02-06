interface BenchmarkBarProps {
  label: string;
  value: number;
  percentile: number;
  cohortP25: number;
  cohortP75: number;
  cohortMedian: number;
  unit?: string;
  formatValue?: (v: number) => string;
}

export const BenchmarkBar = ({
  label,
  value,
  percentile,
  cohortP25,
  cohortP75,
  cohortMedian,
  unit = "",
  formatValue,
}: BenchmarkBarProps) => {
  const pctClamped = Math.max(0, Math.min(100, percentile));

  const quartileLabel =
    pctClamped >= 75
      ? "Top quartile"
      : pctClamped >= 50
        ? "Above median"
        : pctClamped >= 25
          ? "Below median"
          : "Bottom quartile";

  const quartileColor =
    pctClamped >= 75
      ? "text-emerald-600"
      : pctClamped >= 50
        ? "text-vc-primary"
        : pctClamped >= 25
          ? "text-amber-600"
          : "text-rose-500";

  const displayValue = formatValue
    ? formatValue(value)
    : `${value.toLocaleString()}${unit}`;

  const displayMedian = formatValue
    ? formatValue(cohortMedian)
    : `${cohortMedian.toLocaleString()}${unit}`;

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-mono text-vc-primary">{label}</span>
        <span className={`text-xs font-mono ${quartileColor}`}>
          {displayValue} · P{pctClamped}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-gray-100 w-full">
        {/* P25-P75 range */}
        <div
          className="absolute top-0 h-full bg-gray-200"
          style={{
            left: `${Math.min(cohortP25, cohortP75) / Math.max(cohortP75 * 1.5, 1) * 100}%`,
            width: `${Math.abs(cohortP75 - cohortP25) / Math.max(cohortP75 * 1.5, 1) * 100}%`,
          }}
        />

        {/* Company marker */}
        <div
          className="absolute top-0 h-full w-1 bg-accent"
          style={{ left: `${pctClamped}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[11px] font-mono text-vc-secondary">{quartileLabel}</span>
        <span className="text-[11px] font-mono text-vc-secondary">
          Median: {displayMedian}
        </span>
      </div>
    </div>
  );
};
