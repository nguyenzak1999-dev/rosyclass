"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { month: "T1", leads: 45 },
  { month: "T2", leads: 52 },
  { month: "T3", leads: 38 },
  { month: "T4", leads: 65 },
  { month: "T5", leads: 48 },
  { month: "T6", leads: 70 },
]

const chartConfig = {
  leads: {
    label: "Khách hàng mới",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function LeadsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="month"
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
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="leads"
            stroke="hsl(var(--chart-3))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorLeads)"
            activeDot={{ r: 6, fill: "hsl(var(--chart-3))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
