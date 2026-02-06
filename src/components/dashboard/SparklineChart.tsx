"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";

interface SparklineChartProps {
  data: { value: number }[];
  color?: string;
  width?: number;
  height?: number;
}

export const SparklineChart = ({
  data,
  color,
  width = 80,
  height = 28,
}: SparklineChartProps) => {
  if (data.length < 2) return null;

  // Determine trend color from first to last value
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const trendColor = color ?? (last > first ? "#059669" : last < first ? "#e11d48" : "#888888");

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={trendColor}
            strokeWidth={1.5}
            dot={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              fontSize: "11px",
              fontFamily: "monospace",
              padding: "4px 8px",
            }}
            formatter={(v) => [typeof v === 'number' ? v.toLocaleString() : '', ""]}
            labelFormatter={() => ""}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
