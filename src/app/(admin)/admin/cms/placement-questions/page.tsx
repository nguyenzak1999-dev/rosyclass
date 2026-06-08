import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { columns } from "./components/columns"
import { PlacementQuestionDialog } from "./components/placement-question-dialog"
import { PlacementQuestionFilters } from "./components/placement-question-filters"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    type?: string
    level?: string
    isPublished?: string
  }>
}

export default async function PlacementQuestionsPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.PlacementQuestionWhereInput = {}
  if (filters.type) {
    where.type = filters.type
  }
  if (filters.level) {
    where.level = filters.level as Prisma.EnumCourseLevelFilter
  }
  if (filters.isPublished === "true") {
    where.isPublished = true
  } else if (filters.isPublished === "false") {
    where.isPublished = false
  }

  const questions = await prisma.placementQuestion.findMany({
    where,
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  })

  // Stats
  const stats = {
    total: questions.length,
    published: questions.filter((q) => q.isPublished).length,
    byType: new Set(questions.map((q) => q.type)).size,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Câu hỏi Placement Test</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} câu hỏi · {stats.published} đang hiện · {stats.byType} loại
          </p>
        </div>
        <PlacementQuestionDialog />
      </div>

      <PlacementQuestionFilters
        currentType={filters.type || ""}
        currentLevel={filters.level || ""}
        currentIsPublished={filters.isPublished || ""}
      />

      <DataTable
        columns={columns}
        data={questions}
        searchKey="question"
        searchPlaceholder="Tìm câu hỏi..."
      />
    </div>
  )
}
