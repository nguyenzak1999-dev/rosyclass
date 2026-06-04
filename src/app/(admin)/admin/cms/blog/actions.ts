"use server"

import { prisma } from "@/lib/prisma"
import { blogPostSchema, type BlogPostFormValues } from "@/lib/schemas/blog-post"
import { revalidatePath } from "next/cache"

export async function upsertBlogPost(data: BlogPostFormValues) {
  try {
    const parsed = blogPostSchema.parse(data)

    const payload = {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      thumbnail: parsed.thumbnail || null,
      status: parsed.status as any,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      publishedAt: parsed.status === 'PUBLISHED' ? new Date() : null,
    }

    if (parsed.id) {
      await prisma.blogPost.update({
        where: { id: parsed.id },
        data: payload,
      })
    } else {
      await prisma.blogPost.create({ data: payload })
    }

    revalidatePath("/admin/cms/blog")
    revalidatePath("/goc-hoc-tap")
    return { success: true }
  } catch (error: any) {
    console.error("BlogPost upsert error:", error)
    if (error.code === 'P2002') {
      return { success: false, error: "Slug này đã tồn tại" }
    }
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath("/admin/cms/blog")
    revalidatePath("/goc-hoc-tap")
    return { success: true }
  } catch (error: any) {
    console.error("BlogPost delete error:", error)
    return { success: false, error: "Không thể xóa bài viết này" }
  }
}
