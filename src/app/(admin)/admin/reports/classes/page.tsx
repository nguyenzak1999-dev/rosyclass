import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ClassOccupancyReportPage() {
  const classes = await prisma.class.findMany({
    include: {
      course: { select: { name: true } },
      teacher: { select: { fullName: true } },
      branch: { select: { name: true } },
      _count: {
        select: { students: { where: { status: "ACTIVE" } } },
      },
    },
  })

  // Stats
  const totalClasses = classes.length
  const activeClasses = classes.filter(
    (c) => c.status === "ACTIVE" || c.status === "UPCOMING"
  ).length
  const totalCapacity = classes.reduce((sum, c) => sum + c.maxStudents, 0)
  const totalEnrolled = classes.reduce((sum, c) => sum + c._count.students, 0)
  const overallOccupancy = totalCapacity > 0
    ? Math.round((totalEnrolled / totalCapacity) * 100)
    : 0

  // Lớp đầy / sắp đầy / còn nhiều chỗ
  const fullClasses = classes.filter(
    (c) => c._count.students >= c.maxStudents && c.status !== "COMPLETED" && c.status !== "CANCELLED"
  )
  const almostFullClasses = classes.filter(
    (c) =>
      c._count.students / c.maxStudents >= 0.7 &&
      c._count.students < c.maxStudents &&
      c.status !== "COMPLETED" &&
      c.status !== "CANCELLED"
  )
  const lowOccupancyClasses = classes.filter(
    (c) =>
      c._count.students / c.maxStudents < 0.3 &&
      c.status === "ACTIVE"
  )

  // Sắp xếp theo tỷ lệ lấp đầy
  const sortedByOccupancy = classes
    .map((c) => ({
      ...c,
      occupancy: c.maxStudents > 0 ? Math.round((c._count.students / c.maxStudents) * 100) : 0,
      remaining: c.maxStudents - c._count.students,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo lấp đầy lớp học</h1>
        <p className="text-sm text-muted-foreground">
          Tỷ lệ lấp đầy từng lớp · {totalEnrolled}/{totalCapacity} chỗ
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lớp</CardDescription>
            <CardTitle className="text-3xl">{totalClasses}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{activeClasses} đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Tổng HV
            </CardDescription>
            <CardTitle className="text-3xl">{totalEnrolled}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Đang học ACTIVE</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tỷ lệ lấp đầy TB
            </CardDescription>
            <CardTitle className="text-3xl text-blue-700">{overallOccupancy}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${overallOccupancy}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lớp đầy
            </CardDescription>
            <CardTitle className="text-3xl text-red-700">{fullClasses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {almostFullClasses.length} sắp đầy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Lớp đầy */}
        {fullClasses.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Lớp đã đầy ({fullClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {fullClasses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/classes/${c.id}`}
                    className="flex items-center justify-between p-2 border border-red-200 rounded hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.course.name}</p>
                    </div>
                    <Badge variant="destructive">
                      {c._count.students}/{c.maxStudents}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sắp đầy */}
        {almostFullClasses.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-700 text-base flex items-center gap-2">
                ⚠️ Sắp đầy ({almostFullClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {almostFullClasses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/classes/${c.id}`}
                    className="flex items-center justify-between p-2 border border-yellow-200 rounded hover:bg-yellow-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Còn {c.maxStudents - c._count.students} chỗ
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {c._count.students}/{c.maxStudents}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Còn nhiều chỗ */}
        {lowOccupancyClasses.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 text-base flex items-center gap-2">
                💡 Còn nhiều chỗ ({lowOccupancyClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {lowOccupancyClasses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/classes/${c.id}`}
                    className="flex items-center justify-between p-2 border border-blue-200 rounded hover:bg-blue-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Còn {c.maxStudents - c._count.students} chỗ
                      </p>
                    </div>
                    <Badge variant="outline">
                      {c._count.students}/{c.maxStudents}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bảng tất cả lớp */}
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ lấp đầy tất cả lớp</CardTitle>
          <CardDescription>Sắp xếp theo % lấp đầy giảm dần</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedByOccupancy.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lớp nào.</p>
          ) : (
            <div className="space-y-2">
              {sortedByOccupancy.map((c) => {
                const color =
                  c.occupancy >= 100
                    ? "bg-red-500"
                    : c.occupancy >= 70
                    ? "bg-yellow-500"
                    : c.occupancy >= 30
                    ? "bg-blue-500"
                    : "bg-gray-400"
                return (
                  <Link
                    key={c.id}
                    href={`/admin/classes/${c.id}`}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{c.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.course.name}
                        {c.teacher && ` · ${c.teacher.fullName}`}
                        {c.branch && ` · ${c.branch.name}`}
                      </p>
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{c._count.students}/{c.maxStudents}</span>
                        <span className="font-bold">{c.occupancy}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color}`}
                          style={{ width: `${c.occupancy}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
