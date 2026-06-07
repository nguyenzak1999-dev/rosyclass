"use client"

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const chartConfig = {
  totalStudents: {
    label: "Tổng học viên",
    color: "var(--chart-1)",
  },
  newStudents: {
    label: "Học viên mới",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function StudentGrowthChart({
  data,
}: {
  data: { month: string; newStudents: number; totalStudents: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="totalStudents" fill="var(--color-totalStudents)" radius={[4, 4, 0, 0]} barSize={40} />
          <Line type="monotone" dataKey="newStudents" stroke="var(--color-newStudents)" strokeWidth={3} dot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
