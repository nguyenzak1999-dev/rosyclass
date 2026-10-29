"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { blogPostSchema, type BlogPostFormValues } from "@/lib/schemas/blog-post"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import { formatBlogContent } from "@/lib/blog-content"
import { generateSlug } from "@/lib/slug"
import type { Prisma } from "@/generated/prisma/client"

export async function upsertBlogPost(data: BlogPostFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const result = blogPostSchema.safeParse(data)
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || "Dữ liệu bài viết không hợp lệ" }
    }
    const parsed = result.data

    // Slug luôn ở dạng URL hợp lệ (không dấu, không khoảng trắng, không "/")
    const slug = generateSlug(parsed.slug)
    if (slug.length < 2) return { success: false, error: "Slug phải có ít nhất 2 ký tự (chữ không dấu, số, gạch ngang)" }

    const content = formatBlogContent(parsed.content)
    if (!content) return { success: false, error: "Nội dung không được để trống" }

    const existing = parsed.id
      ? await prisma.blogPost.findUnique({ where: { id: parsed.id }, select: { slug: true, publishedAt: true } })
      : null
    if (parsed.id && !existing) return { success: false, error: "Không tìm thấy bài viết" }

    const payload: Prisma.BlogPostUncheckedCreateInput = {
      title: parsed.title.trim(),
      slug,
      excerpt: parsed.excerpt?.trim() || null,
      content,
      thumbnail: parsed.thumbnail?.trim() || null,
      status: parsed.status,
      seoTitle: parsed.seoTitle?.trim() || null,
      seoDescription: parsed.seoDescription?.trim() || null,
      // Giữ ngày xuất bản gốc khi sửa bài đã xuất bản; chỉ đặt ngày mới lần đầu xuất bản
      publishedAt: parsed.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : null,
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
    revalidatePath(`/goc-hoc-tap/${slug}`)
    if (existing && existing.slug !== slug) revalidatePath(`/goc-hoc-tap/${existing.slug}`)
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
    const post = await prisma.blogPost.delete({ where: { id }, select: { slug: true } })
    revalidatePath("/admin/cms/blog")
    revalidatePath("/goc-hoc-tap")
    revalidatePath(`/goc-hoc-tap/${post.slug}`)
    return { success: true }
  } catch (error: unknown) {
    console.error("BlogPost delete error:", error)
    return { success: false, error: "Không thể xóa bài viết này" }
  }
}
