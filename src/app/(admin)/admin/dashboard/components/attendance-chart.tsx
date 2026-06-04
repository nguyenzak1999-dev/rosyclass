"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { day: "Thứ 2", rate: 92 },
  { day: "Thứ 3", rate: 95 },
  { day: "Thứ 4", rate: 88 },
  { day: "Thứ 5", rate: 94 },
  { day: "Thứ 6", rate: 98 },
  { day: "Thứ 7", rate: 85 },
  { day: "CN", rate: 90 },
]

const chartConfig = {
  rate: {
    label: "Tỷ lệ đi học (%)",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function AttendanceChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.9} />
              <stop offset="50%" stopColor="var(--chart-2)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
          <XAxis
            dataKey="day"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="var(--chart-4)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRate)"
            activeDot={{ r: 6, fill: "var(--chart-4)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
