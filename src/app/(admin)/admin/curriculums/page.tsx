import Link from "next/link"
import { BookOpenCheck, GraduationCap, Layers, NotebookPen } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CurriculumDialog } from "./components/curriculum-dialog"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang dùng",
  DRAFT: "Bản nháp",
  INACTIVE: "Ngừng dùng",
  PUBLISHED: "Đã công bố",
}

export default async function CurriculumsPage() {
  const user = await requireAdminUser()
  const canWrite = hasPermission(user, PERMISSIONS.coursesWrite)

  const curriculums = await prisma.curriculum.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      units: { select: { _count: { select: { lessons: true } } } },
      classes: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  })

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Chương trình học</h1>
          <p className="text-sm text-muted-foreground">
            Soạn Unit và bài học; gắn chương trình cho lớp để mỗi buổi tự biết hôm nay dạy gì.
          </p>
        </div>
        {canWrite ? <CurriculumDialog /> : null}
      </div>

      {curriculums.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 text-center">
          <BookOpenCheck className="h-10 w-10 text-muted-foreground/60" />
          <p className="font-medium">Chưa có chương trình học nào</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Tạo chương trình mới, hoặc chạy <code className="rounded bg-muted px-1">npm run db:seed-curriculum</code> để có
            sẵn chương trình mẫu &quot;Tiếng Anh lớp 1&quot; rồi chỉnh lại theo trung tâm.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {curriculums.map((curriculum) => {
            const lessonCount = curriculum.units.reduce((sum, unit) => sum + unit._count.lessons, 0)
            return (
              <Card key={curriculum.id} className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/admin/curriculums/${curriculum.id}`} className="hover:underline">
                      {curriculum.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {curriculum.gradeLabel}
                    {curriculum.sourceBook ? ` · ${curriculum.sourceBook}` : ""}
                  </CardDescription>
                  <CardAction>
                    <Badge variant={curriculum.status === "ACTIVE" ? "default" : "outline"}>
                      {STATUS_LABELS[curriculum.status] ?? curriculum.status}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4" /> {curriculum.units.length} Unit
                    </span>
                    <span className="flex items-center gap-1.5">
                      <NotebookPen className="h-4 w-4" /> {lessonCount} bài
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" /> {curriculum.classes.length} lớp đang dùng
                    </span>
                  </div>
                  {curriculum.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {curriculum.classes.slice(0, 6).map((cls) => (
                        <Badge key={cls.id} variant="secondary" render={<Link href={`/admin/classes/${cls.id}`} />}>
                          {cls.name}
                        </Badge>
                      ))}
                      {curriculum.classes.length > 6 ? (
                        <Badge variant="outline">+{curriculum.classes.length - 6}</Badge>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/curriculums/${curriculum.id}`} />}>
                    {canWrite ? "Soạn Unit & bài học" : "Xem chương trình"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
