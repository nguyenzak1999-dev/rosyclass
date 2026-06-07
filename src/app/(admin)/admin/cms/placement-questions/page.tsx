import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { columns } from "./components/columns"
import { PlacementQuestionDialog } from "./components/placement-question-dialog"

export default async function PlacementQuestionsPage() {
  const questions = await prisma.placementQuestion.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Câu hỏi Placement Test</h1>
        <PlacementQuestionDialog />
      </div>

      <DataTable
        columns={columns}
        data={questions}
        searchKey="question"
        searchPlaceholder="Tìm câu hỏi..."
      />
    </div>
  )
}
