"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { DataTable } from "@/components/ui/data-table"
import { columns, type ScheduleData } from "./columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  LayoutGrid,
  List,
} from "lucide-react"

interface SchedulesClientProps {
  schedules: ScheduleData[]
}

const sessionStatusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  SCHEDULED: { label: "Sắp tới", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "secondary" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },
  MAKE_UP: { label: "Phụ đạo", variant: "outline" },
}

export function SchedulesClient({ schedules }: SchedulesClientProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")

  const filteredSchedules = React.useMemo(() => {
    if (!query) return schedules
    const lower = query.toLowerCase()
    return schedules.filter(s => 
      s.class?.name?.toLowerCase().includes(lower) ||
      s.class?.course?.name?.toLowerCase().includes(lower) ||
      s.teacher?.fullName?.toLowerCase().includes(lower) ||
      s.room?.name?.toLowerCase().includes(lower) ||
      (s.topic && s.topic.toLowerCase().includes(lower))
    )
  }, [schedules, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo lớp, khóa học, giáo viên, phòng..."
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex border rounded-lg p-0.5 bg-muted/40 shrink-0 self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        filteredSchedules.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSchedules.map((schedule) => {
              const config = sessionStatusMap[schedule.status] || { label: schedule.status, variant: "outline" }
              const count = schedule._count?.attendances ?? 0
              return (
                <Card
                  key={schedule.id}
                  className="cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30 hover:shadow-sm flex flex-col justify-between"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
                      return
                    }
                    router.push(`/admin/schedules/${schedule.id}`)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{format(new Date(schedule.sessionDate), "dd/MM/yyyy")}</span>
                        </div>
                        <h3 className="font-semibold text-base truncate text-primary mt-1" onClick={() => router.push(`/admin/classes/${schedule.class?.id}`)}>
                          {schedule.class?.name || "—"}
                        </h3>
                        {schedule.class?.course && (
                          <p className="text-xs text-muted-foreground truncate">{schedule.class.course.name}</p>
                        )}
                      </div>
                      <Badge variant={config.variant} className="shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3 text-sm flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    {schedule.teacher && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span>GV: {schedule.teacher.fullName}</span>
                      </div>
                    )}
                    {schedule.room && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span>Phòng: {schedule.room.name}</span>
                      </div>
                    )}
                    {schedule.topic && (
                      <div className="text-xs text-muted-foreground border-t pt-2 mt-1 italic">
                        Chủ đề: {schedule.topic}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-between gap-2 h-12">
                    <Badge variant={count > 0 ? "default" : "outline"} className="text-xs">
                      {count > 0 ? `${count} Học viên` : "Chưa điểm danh"}
                    </Badge>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/attendance/${schedule.id}`)}>
                        Điểm danh
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/schedules/${schedule.id}`)}>
                        Chi tiết
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">Không tìm thấy buổi học phù hợp</p>
          </div>
        )
      ) : (
        <DataTable
          columns={columns as any}
          data={filteredSchedules}
          onRowClick={(row) => router.push(`/admin/schedules/${row.id}`)}
        />
      )}
    </div>
  )
}
