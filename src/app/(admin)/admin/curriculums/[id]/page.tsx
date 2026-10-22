import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { parseJsonList } from "@/lib/curriculum"
import { Button } from "@/components/ui/button"
import { CurriculumEditorClient, type EditorCurriculum } from "./curriculum-editor-client"

export const dynamic = "force-dynamic"

export default async function CurriculumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAdminUser()

  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { lessons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
      },
      classes: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  })
  if (!curriculum) notFound()

  const data: EditorCurriculum = {
    id: curriculum.id,
    name: curriculum.name,
    gradeLabel: curriculum.gradeLabel,
    description: curriculum.description,
    sourceBook: curriculum.sourceBook,
    status: curriculum.status,
    classes: curriculum.classes,
    units: curriculum.units.map((unit) => ({
      id: unit.id,
      order: unit.order,
      title: unit.title,
      objectives: unit.objectives,
      vocabulary: parseJsonList(unit.vocabulary),
      sentencePatterns: parseJsonList(unit.sentencePatterns),
      phonics: unit.phonics,
      songUrl: unit.songUrl,
      lessons: unit.lessons.map((lesson) => ({
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        objectives: lesson.objectives,
        activities: lesson.activities,
        materials: lesson.materials,
        mediaUrl: lesson.mediaUrl,
        homework: lesson.homework,
      })),
    })),
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" render={<Link href="/admin/curriculums" />} aria-label="Quay lại">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{curriculum.name}</h1>
          <p className="text-sm text-muted-foreground">Chương trình học · {curriculum.gradeLabel}</p>
        </div>
      </div>

      <CurriculumEditorClient curriculum={data} canWrite={hasPermission(user, PERMISSIONS.coursesWrite)} />
    </div>
  )
}
