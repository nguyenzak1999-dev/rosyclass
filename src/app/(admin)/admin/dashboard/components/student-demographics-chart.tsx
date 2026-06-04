"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const data = [
  { name: "Tiếng Anh Trẻ Em", value: 45 },
  { name: "Tiếng Anh Thiếu Niên", value: 30 },
  { name: "IELTS", value: 20 },
  { name: "Giao Tiếp", value: 25 },
]

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

const chartConfig = {
  value: {
    label: "Học viên",
  },
  "Tiếng Anh Trẻ Em": {
    label: "Trẻ em",
    color: "var(--chart-1)",
  },
  "Tiếng Anh Thiếu Niên": {
    label: "Thiếu niên",
    color: "var(--chart-2)",
  },
  "IELTS": {
    label: "IELTS",
    color: "var(--chart-3)",
  },
  "Giao Tiếp": {
    label: "Giao tiếp",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function StudentDemographicsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
