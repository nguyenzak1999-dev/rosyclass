"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { blogPostSchema, type BlogPostFormValues } from "@/lib/schemas/blog-post"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import { formatBlogContent } from "@/lib/blog-content"
import type { Prisma } from "@prisma/client"

export async function upsertBlogPost(data: BlogPostFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = blogPostSchema.parse(data)

    const payload: Prisma.BlogPostUncheckedCreateInput = {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt || null,
      content: formatBlogContent(parsed.content),
      thumbnail: parsed.thumbnail || null,
      status: parsed.status,
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
    revalidatePath(`/goc-hoc-tap/${parsed.slug}`)
    return { success: true }
  } catch (error: unknown) {
    console.error("BlogPost upsert error:", error)
    if (isPrismaUniqueError(error)) {
      return { success: false, error: "Slug này đã tồn tại" }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath("/admin/cms/blog")
    revalidatePath("/goc-hoc-tap")
    return { success: true }
  } catch (error: unknown) {
    console.error("BlogPost delete error:", error)
    return { success: false, error: "Không thể xóa bài viết này" }
  }
}
