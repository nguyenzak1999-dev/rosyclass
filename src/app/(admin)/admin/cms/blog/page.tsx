import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { BlogPostDialog } from "./components/blog-post-dialog"

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Góc học tập (Blog)</h1>
        <BlogPostDialog />
      </div>

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Tìm kiếm bài viết theo tiêu đề..."
      />
    </div>
  )
}
