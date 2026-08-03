import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { toShortDateLabel } from "../../utils/format";
import type { DailyCount } from "../../hooks/useStats";

interface DailyChartProps {
  data: DailyCount[];
}

export function DailyChart({ data }: DailyChartProps) {
  const chartData = data.map((item) => ({
    label: toShortDateLabel(item.date),
    count: item.count,
    correct: item.correct,
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "currentColor" }}
            interval={Math.max(Math.floor(chartData.length / 6), 1)}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value, name) => [
              `${String(value)}問`,
              name === "count" ? "解答数" : "正答数",
            ]}
          />
          <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
          <Bar dataKey="correct" fill="#22c55e" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
