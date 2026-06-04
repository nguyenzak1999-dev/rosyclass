"use client"

import {
  Bar,
  BarChart,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface EnrollmentChartProps {
  data: { month: string; newStudents: number; droppedOut: number }[]
}

const chartConfig = {
  newStudents: {
    label: "Học viên mới",
    color: "hsl(var(--chart-2))",
  },
  droppedOut: {
    label: "Nghỉ học",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="newStudents" fill="var(--color-newStudents)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="droppedOut" fill="var(--color-droppedOut)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
