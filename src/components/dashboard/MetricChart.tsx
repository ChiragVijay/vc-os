"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface MetricChartProps {
  data: Record<string, unknown>[];
  lines: {
    dataKey: string;
    label: string;
    color: string;
  }[];
  xKey?: string;
  height?: number;
  formatY?: (v: number) => string;
  formatTooltip?: (v: number) => string;
}

export const MetricChart = ({
  data,
  lines,
  xKey = "month",
  height = 280,
  formatY,
  formatTooltip,
}: MetricChartProps) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e5e5"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fontFamily: "monospace", fill: "#888" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "monospace", fill: "#888" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatY}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              fontSize: "11px",
              fontFamily: "monospace",
              padding: "8px 12px",
            }}
            formatter={(value, name) => {
              const v = typeof value === 'number' ? value : 0;
              const n = typeof name === 'string' ? name : '';
              const line = lines.find((l) => l.dataKey === n);
              const formatted = formatTooltip
                ? formatTooltip(v)
                : v.toLocaleString();
              return [formatted, line?.label ?? n];
            }}
          />
          {lines.length > 1 && (
            <Legend
              wrapperStyle={{
                fontSize: "10px",
                fontFamily: "monospace",
              }}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
