"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type ClassData } from "./columns"
import { LazyClassDialog } from "./class-dialog-lazy"
import { ExportExcelButton } from "./export-excel-button"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Search,
  UserRound,
  UsersRound,
  LayoutGrid,
  List,
} from "lucide-react"

interface ClassesClientProps {
  classes: ClassData[]
  courses: { id: string; name: string }[]
  teachers: { id: string; fullName: string }[]
  teachingAssistants: { id: string; fullName: string }[]
  branches: { id: string; name: string }[]
  rooms: { id: string; name: string; capacity: number; branchId: string; branch: { name: string } }[]
  students: { id: string; fullName: string; phone: string | null; email: string | null }[]
  filterSlot?: React.ReactNode
}

export function ClassesClient({
  classes,
  courses,
  teachers,
  teachingAssistants,
  branches,
  rooms,
  students,
  filterSlot,
}: ClassesClientProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const normalizedQuery = query.trim().toLowerCase()

  const filteredClasses = React.useMemo(() => {
    if (!normalizedQuery) return classes

    return classes.filter((classData) => {
      const haystack = [
        classData.name,
        classData.course?.name,
        classData.teacher?.fullName,
        classData.teachingAssistant?.fullName,
        classData.branch?.name,
        classData.room?.name,
        classData.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [classes, normalizedQuery])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Lớp học</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {classes.length} lớp học
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <ExportExcelButton data={classes} />
          <LazyClassDialog
            courses={courses}
            teachers={teachers}
            teachingAssistants={teachingAssistants}
            branches={branches}
            rooms={rooms}
            students={students}
          />
        </div>
      </div>

      {filterSlot}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm theo tên lớp, khóa học, giáo viên..."
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex border rounded-lg p-0.5 bg-muted/40 shrink-0">
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
      </div>      {viewMode === "grid" ? (
        filteredClasses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClasses.map((classData) => (
              <ClassGridCard
                key={classData.id}
                classData={classData}
                courses={courses}
                teachers={teachers}
                teachingAssistants={teachingAssistants}
                branches={branches}
                rooms={rooms}
                students={students}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center">
            <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">Không tìm thấy lớp học phù hợp</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Thử đổi từ khóa tìm kiếm hoặc xoá bớt bộ lọc phía trên.
            </p>
          </div>
        )
      ) : (
        <DataTable
          columns={getColumns(courses) as any}
          data={filteredClasses}
          onRowClick={(row) => router.push(`/admin/classes/${row.id}`)}
        />
      )}
    </div>
  )
}

function ClassGridCard({
  classData,
  courses,
  teachers,
  teachingAssistants,
  branches,
  rooms,
  students,
}: {
  classData: ClassData
  courses: { id: string; name: string }[]
  teachers: { id: string; fullName: string }[]
  teachingAssistants: { id: string; fullName: string }[]
  branches: { id: string; name: string }[]
  rooms: { id: string; name: string; capacity: number; branchId: string; branch: { name: string } }[]
  students: { id: string; fullName: string; phone: string | null; email: string | null }[]
}) {
  const router = useRouter()
  const activeStudents = classData._count?.students ?? 0
  const capacityPercent =
    classData.maxStudents > 0
      ? Math.min(100, Math.round((activeStudents / classData.maxStudents) * 100))
      : 0

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
      return
    }
    router.push(`/admin/classes/${classData.id}`)
  }

  return (
    <Card
      className="rounded-lg cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30 hover:shadow-sm"
      onClick={handleCardClick}
    >
      <CardHeader className="gap-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              <Link href={`/admin/classes/${classData.id}`} className="hover:underline">
                {classData.name}
              </Link>
            </CardTitle>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {classData.course?.name || "Chưa gán khóa học"}
            </p>
          </div>
        </div>
        <CardAction>
          <BadgeStatus status={classData.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <ClassMetaItem
            icon={<UserRound className="h-4 w-4" />}
            label="Giáo viên"
            value={classData.teacher?.fullName || "Chưa phân công"}
          />
          <ClassMetaItem
            icon={<Building2 className="h-4 w-4" />}
            label="Địa điểm"
            value={classData.room?.name || classData.branch?.name || "—"}
          />
          <ClassMetaItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Bắt đầu"
            value={formatDate(classData.startDate)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <UsersRound className="h-4 w-4" />
              Sĩ số
            </span>
            <span className="font-medium">
              {activeStudents}/{classData.maxStudents}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/admin/classes/${classData.id}`} />}>
          Chi tiết
        </Button>
        <LazyClassDialog
          initialData={{
            id: classData.id,
            name: classData.name,
            courseId: classData.courseId,
            maxStudents: classData.maxStudents,
            startDate: classData.startDate as Date | null,
            expectedEndDate: classData.expectedEndDate as Date | null,
            status: classData.status,
            teacherId: classData.teacherId,
            teachingAssistantId: classData.teachingAssistantId,
            branchId: classData.branchId,
            roomId: classData.roomId,
            studentIds: (classData.students || [])
              .filter((student) => student.status === "ACTIVE")
              .map((student) => student.studentId),
            notes: classData.notes ?? undefined,
          }}
          courses={courses}
          teachers={teachers}
          teachingAssistants={teachingAssistants}
          branches={branches}
          rooms={rooms}
          students={students}
          trigger={<Button variant="ghost" size="sm">Sửa</Button>}
        />
      </CardFooter>
    </Card>
  )
}

function ClassMetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[1rem_5rem_minmax(0,1fr)] items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}

function formatDate(value: Date | string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}
