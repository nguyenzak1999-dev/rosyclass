import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { BlogPostForm } from "../../components/blog-post-form"

export const dynamic = "force-dynamic"

interface EditBlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      thumbnail: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
    },
  })

  if (!post) notFound()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/admin/cms/blog" />}>
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Sửa bài viết</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật nội dung, ảnh trong bài, preview và thông tin SEO.
        </p>
      </div>

      <BlogPostForm initialData={post} />
    </div>
  )
}
