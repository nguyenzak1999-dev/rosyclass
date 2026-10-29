"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { formatVietnam } from "@/lib/curriculum"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { StudentDialog } from "./student-dialog"
import { toStudentFormInput } from "./student-form"
import { ExportExcelButton } from "./export-excel-button"
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
  Phone,
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  Search,
  LayoutGrid,
  List,
} from "lucide-react"

interface StudentsClientProps {
  formattedStudents: any[]
  parents: any[]
}

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Đang học", variant: "default" },
  WAITING_CLASS: { label: "Chờ xếp lớp", variant: "outline" },
  RESERVED: { label: "Bảo lưu", variant: "secondary" },
  PAUSED: { label: "Tạm dừng", variant: "secondary" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  DROPPED: { label: "Đã nghỉ", variant: "destructive" },
}

export function StudentsClient({ formattedStudents, parents }: StudentsClientProps) {
  const router = useRouter()
  const columns = getColumns(parents)
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")

  const filteredStudents = React.useMemo(() => {
    if (!query) return formattedStudents
    const lower = query.toLowerCase()
    return formattedStudents.filter(s => 
      s.fullName?.toLowerCase().includes(lower) ||
      s.phone?.toLowerCase().includes(lower) ||
      s.email?.toLowerCase().includes(lower) ||
      s.parentName?.toLowerCase().includes(lower) ||
      s.className?.toLowerCase().includes(lower)
    )
  }, [formattedStudents, query])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Học viên</h1>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <ExportExcelButton data={formattedStudents} />
          <StudentDialog parents={parents} />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm học viên theo tên, SĐT, lớp..."
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
        filteredStudents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map((student) => {
              const config = statusMap[student.status] || { label: student.status, variant: "outline" }
              return (
                <Card
                  key={student.id}
                  className="cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30 hover:shadow-sm flex flex-col justify-between"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
                      return
                    }
                    router.push(`/admin/students/${student.id}`)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base truncate hover:underline text-primary" onClick={() => router.push(`/admin/students/${student.id}`)}>
                            {student.fullName}
                          </h3>
                          {student.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={config.variant as any} className="shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3 text-sm flex-1 flex flex-col gap-2">
                    {student.parentName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">PH: {student.parentName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">Lớp: {student.className || "—"}</span>
                    </div>
                    {student.currentLevel && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">Trình độ: {student.currentLevel}</span>
                      </div>
                    )}
                    {student.joinedAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span>Nhập học: {formatVietnam(new Date(student.joinedAt), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter
                    className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-end gap-2 h-12"
                    // Dialog sửa render qua portal nhưng sự kiện vẫn nổi lên Card (onClick chuyển trang)
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StudentDialog 
                      student={toStudentFormInput(student)}
                      parents={parents}
                      trigger={<Button variant="ghost" size="sm">Sửa</Button>} 
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center">
            <User className="mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">Không tìm thấy học viên phù hợp</p>
          </div>
        )
      ) : (
        <DataTable 
          columns={columns as any} 
          data={filteredStudents} 
          onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
        />
      )}
    </div>
  )
}
