"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, type StaffData } from "./columns"
import { TeacherDialog } from "./teacher-dialog"
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
  Mail,
  Search,
  LayoutGrid,
  List,
  User,
  GraduationCap,
  Award,
} from "lucide-react"

interface TeachersClientProps {
  staff: StaffData[]
}

export function TeachersClient({ staff }: TeachersClientProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")

  const filteredStaff = React.useMemo(() => {
    if (!query) return staff
    const lower = query.toLowerCase()
    return staff.filter(s => 
      s.fullName?.toLowerCase().includes(lower) ||
      s.email?.toLowerCase().includes(lower) ||
      s.phone?.toLowerCase().includes(lower) ||
      s.role?.name?.toLowerCase().includes(lower) ||
      s.teacherProfile?.specialties?.toLowerCase().includes(lower)
    )
  }, [staff, query])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Nhân sự</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {staff.length} nhân sự
          </p>
        </div>
        <div className="flex sm:items-center">
          <TeacherDialog />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm nhân sự theo tên, email, vai trò..."
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
        filteredStaff.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((member) => {
              const teacherId = member.teacherProfile?.id
              return (
                <Card
                  key={member.id}
                  className={`flex flex-col justify-between transition-all hover:border-primary/30 hover:shadow-sm ${
                    teacherId ? "cursor-pointer hover:bg-accent/10" : ""
                  }`}
                  onClick={(e) => {
                    if (!teacherId) return
                    const target = e.target as HTMLElement
                    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
                      return
                    }
                    router.push(`/admin/teachers/${teacherId}`)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {member.teacherProfile?.avatar || member.avatar ? (
                          <img
                            src={member.teacherProfile?.avatar || member.avatar || ""}
                            alt={member.fullName}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className={`font-semibold text-base truncate ${teacherId ? "hover:underline text-primary" : ""}`} onClick={() => teacherId && router.push(`/admin/teachers/${teacherId}`)}>
                            {member.fullName}
                          </h3>
                          <Badge variant="outline" className="mt-1">
                            {member.role.name}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={member.status === 'ACTIVE' ? "default" : "destructive"} className="shrink-0">
                        {member.status === 'ACTIVE' ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3 text-sm flex-1 flex flex-col gap-2">
                    {member.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.teacherProfile?.specialties && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">Chuyên môn: {member.teacherProfile.specialties}</span>
                      </div>
                    )}
                    {member.teacherProfile?.certificates && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">Chứng chỉ: {member.teacherProfile.certificates}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-end gap-2 h-12">
                    {teacherId && (
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/teachers/${teacherId}`)}>
                        Hồ sơ
                      </Button>
                    )}
                    <TeacherDialog
                      teacher={{
                        id: member.id,
                        fullName: member.fullName,
                        email: member.email,
                        phone: member.phone || "",
                        status: member.status as any,
                        roleCode: member.role.code as any,
                        bio: member.teacherProfile?.bio || "",
                        specialties: member.teacherProfile?.specialties || "",
                        certificates: member.teacherProfile?.certificates || "",
                        avatar: member.teacherProfile?.avatar || member.avatar || "",
                        showOnHomepage: member.teacherProfile?.showOnHomepage ?? false,
                        hourlyRate: member.teacherProfile?.hourlyRate ?? 0,
                      }}
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
            <p className="font-medium">Không tìm thấy nhân sự phù hợp</p>
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={filteredStaff}
          onRowClick={(row) => {
            const tId = row.teacherProfile?.id
            if (tId) router.push(`/admin/teachers/${tId}`)
          }}
        />
      )}
    </div>
  )
}
