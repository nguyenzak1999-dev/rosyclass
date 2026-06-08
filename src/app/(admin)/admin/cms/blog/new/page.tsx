import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { BlogPostForm } from "../components/blog-post-form"

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/admin/cms/blog" />}>
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Viết bài mới</h1>
          <p className="text-sm text-muted-foreground">
            Soạn bài viết, thêm ảnh, xem preview và tối ưu SEO trước khi xuất bản.
          </p>
        </div>
      </div>

      <BlogPostForm />
    </div>
  )
}
