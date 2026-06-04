"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  {
    name: "T1",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T2",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T3",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T4",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T5",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T6",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T7",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T8",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T9",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T10",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T11",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
  {
    name: "T12",
    total: Math.floor(Math.random() * 50000000) + 10000000,
  },
]

const chartConfig = {
  total: {
    label: "Doanh thu",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `${value / 1000000}M`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="total"
            fill="url(#colorTotal)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
