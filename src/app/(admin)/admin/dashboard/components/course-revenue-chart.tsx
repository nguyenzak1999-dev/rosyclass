"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const chartConfig = {
  kids: {
    label: "Tiếng Anh Trẻ Em",
    color: "var(--chart-1)",
  },
  teens: {
    label: "Tiếng Anh Thiếu Niên",
    color: "var(--chart-2)",
  },
  ielts: {
    label: "IELTS",
    color: "var(--chart-3)",
  },
  communication: {
    label: "Giao Tiếp",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function CourseRevenueChart({
  data,
}: {
  data: { month: string; kids: number; teens: number; ielts: number; communication: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
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
