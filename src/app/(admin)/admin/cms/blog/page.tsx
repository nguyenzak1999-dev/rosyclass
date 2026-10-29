import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { BlogFilters } from "./components/blog-filters"
import { Prisma } from "@/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { PenLine } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const ENTITY_STATUSES = ["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"] as const

interface PageProps {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function BlogAdminPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.BlogPostWhereInput = {}
  // Giá trị lạ trên URL (vd: ?status=abc) làm Prisma ném lỗi enum, nên chỉ lọc khi hợp lệ
  const status = ENTITY_STATUSES.find((value) => value === filters.status)
  if (status) {
    where.status = status
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Stats
  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Góc học tập (Blog)</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} bài viết · {stats.published} đã xuất bản · {stats.drafts} bản nháp
          </p>
        </div>
        <Button render={<Link href="/admin/cms/blog/new" />}>
          <PenLine className="h-4 w-4" />
          Viết bài mới
        </Button>
      </div>

      <BlogFilters currentStatus={status || ""} />

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Tìm kiếm bài viết theo tiêu đề..."
      />
    </div>
  )
}
