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

const data = [
  { month: "Tháng 1", newStudents: 40, totalStudents: 120 },
  { month: "Tháng 2", newStudents: 30, totalStudents: 140 },
  { month: "Tháng 3", newStudents: 45, totalStudents: 175 },
  { month: "Tháng 4", newStudents: 50, totalStudents: 215 },
  { month: "Tháng 5", newStudents: 35, totalStudents: 240 },
  { month: "Tháng 6", newStudents: 60, totalStudents: 290 },
]

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

export function StudentGrowthChart() {
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
