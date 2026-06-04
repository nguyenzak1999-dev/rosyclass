"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const data = [
  { month: "Tháng 1", kids: 120, teens: 80, ielts: 150, communication: 90 },
  { month: "Tháng 2", kids: 130, teens: 85, ielts: 160, communication: 100 },
  { month: "Tháng 3", kids: 140, teens: 95, ielts: 145, communication: 110 },
  { month: "Tháng 4", kids: 155, teens: 110, ielts: 180, communication: 120 },
  { month: "Tháng 5", kids: 160, teens: 125, ielts: 190, communication: 115 },
  { month: "Tháng 6", kids: 180, teens: 140, ielts: 210, communication: 130 },
]

const chartConfig = {
  kids: {
    label: "Tiếng Anh Trẻ Em",
    color: "hsl(var(--chart-1))",
  },
  teens: {
    label: "Tiếng Anh Thiếu Niên",
    color: "hsl(var(--chart-2))",
  },
  ielts: {
    label: "IELTS",
    color: "hsl(var(--chart-3))",
  },
  communication: {
    label: "Giao Tiếp",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function CourseRevenueChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
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
            tickFormatter={(value) => `${value}M`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="kids" stackId="a" fill="var(--color-kids)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="teens" stackId="a" fill="var(--color-teens)" />
          <Bar dataKey="ielts" stackId="a" fill="var(--color-ielts)" />
          <Bar dataKey="communication" stackId="a" fill="var(--color-communication)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
