"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  {
    subject: "Giao tiếp",
    A: 120,
    B: 110,
    fullMark: 150,
  },
  {
    subject: "IELTS",
    A: 98,
    B: 130,
    fullMark: 150,
  },
  {
    subject: "TOEIC",
    A: 86,
    B: 130,
    fullMark: 150,
  },
  {
    subject: "Tiếng Anh Trẻ Em",
    A: 99,
    B: 100,
    fullMark: 150,
  },
  {
    subject: "Ngữ Pháp",
    A: 85,
    B: 90,
    fullMark: 150,
  },
  {
    subject: "Từ Vựng",
    A: 65,
    B: 85,
    fullMark: 150,
  },
]

const chartConfig = {
  A: {
    label: "Giáo viên VN",
    color: "hsl(var(--chart-1))",
  },
  B: {
    label: "Giáo viên NN",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function TeacherHoursChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" fontSize={12} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          <Radar
            name="Giáo viên VN"
            dataKey="A"
            stroke="var(--color-A)"
            fill="var(--color-A)"
            fillOpacity={0.6}
          />
          <Radar
            name="Giáo viên NN"
            dataKey="B"
            stroke="var(--color-B)"
            fill="var(--color-B)"
            fillOpacity={0.6}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
