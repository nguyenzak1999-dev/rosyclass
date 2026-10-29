import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { FaqDialog } from "./components/faq-dialog"
import { FaqFilters } from "./components/faq-filters"
import { columns } from "./components/columns"
import { Prisma } from "@/generated/prisma/client"

export const dynamic = "force-dynamic"

const ENTITY_STATUSES = ["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"] as const

interface PageProps {
  searchParams: Promise<{
    category?: string
    status?: string
  }>
}

export default async function FaqsPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.FaqWhereInput = {}
  if (filters.category) {
    where.category = filters.category
  }
  // Giá trị lạ trên URL (vd: ?status=abc) làm Prisma ném lỗi enum, nên chỉ lọc khi hợp lệ
  const status = ENTITY_STATUSES.find((value) => value === filters.status)
  if (status) {
    where.status = status
  }

  const [faqs, allFaqs] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    }),
    prisma.faq.findMany({ select: { category: true } }),
  ])

  // Lấy danh sách category unique
  const categories = Array.from(
    new Set(allFaqs.map((f) => f.category).filter((c): c is string => !!c))
  ).sort()

  const stats = {
    total: faqs.length,
    active: faqs.filter((f) => f.status === "ACTIVE" || f.status === "PUBLISHED").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} câu hỏi · {stats.active} đang hiện · {categories.length} nhóm
          </p>
        </div>
        <FaqDialog />
      </div>

      <FaqFilters
        currentCategory={filters.category || ""}
        currentStatus={status || ""}
        categories={categories}
      />

      <DataTable
        columns={columns}
        data={faqs}
        searchKey="question"
        searchPlaceholder="Tìm FAQ..."
      />
    </div>
  )
}
