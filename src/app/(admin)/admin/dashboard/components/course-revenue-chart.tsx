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
  preschool: {
    label: "Mầm non",
    color: "var(--chart-1)",
  },
  primarySchool: {
    label: "Tiểu học",
    color: "var(--chart-2)",
  },
  oneOnOne: {
    label: "Kèm 1–1",
    color: "var(--chart-3)",
  },
  other: {
    label: "Khác",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function CourseRevenueChart({
  data,
}: {
  data: { month: string; preschool: number; primarySchool: number; oneOnOne: number; other: number }[]
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
          <Bar dataKey="preschool" stackId="a" fill="var(--color-preschool)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="primarySchool" stackId="a" fill="var(--color-primarySchool)" />
          <Bar dataKey="oneOnOne" stackId="a" fill="var(--color-oneOnOne)" />
          <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
