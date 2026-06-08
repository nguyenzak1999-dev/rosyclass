import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { BlogPostDialog } from "./components/blog-post-dialog"
import { BlogFilters } from "./components/blog-filters"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function BlogAdminPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.BlogPostWhereInput = {}
  if (filters.status) {
    where.status = filters.status as Prisma.EnumEntityStatusFilter
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
        <BlogPostDialog />
      </div>

      <BlogFilters currentStatus={filters.status || ""} />

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Tìm kiếm bài viết theo tiêu đề..."
      />
    </div>
  )
}
