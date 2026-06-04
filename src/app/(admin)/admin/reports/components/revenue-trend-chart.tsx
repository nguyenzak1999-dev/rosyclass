"use client"

import {
  Area,
  AreaChart,
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

interface RevenueTrendChartProps {
  data: { month: string; revenue: number; collected: number }[]
}

const chartConfig = {
  revenue: {
    label: "Học phí phát sinh",
    color: "hsl(var(--chart-1))",
  },
  collected: {
    label: "Đã thu",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  `${Number(value).toLocaleString("vi-VN")} đ`
                }
              />
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#colorRevenue)"
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fill="url(#colorCollected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
