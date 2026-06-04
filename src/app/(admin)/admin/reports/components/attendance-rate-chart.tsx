"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AttendanceRateChartProps {
  data: { month: string; rate: number }[]
}

const chartConfig = {
  rate: {
    label: "Tỷ lệ chuyên cần (%)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function AttendanceRateChart({ data }: AttendanceRateChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => `${value}%`}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(var(--chart-3))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
