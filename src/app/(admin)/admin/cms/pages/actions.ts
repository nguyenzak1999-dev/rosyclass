"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { pageSchema, type PageFormValues } from "@/lib/schemas/page"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import { HOME_PAGE_SLUG, PAGE_SLUG_RE, getPublicPagePath, isReservedSlug } from "@/lib/page-builder/constants"
import { emptyDocument, serializePageDocument } from "@/lib/page-builder/document"

/**
 * Sửa nhanh thông tin trang (tiêu đề, slug, SEO, trạng thái) từ danh sách.
 * Nội dung trang do page builder quản lý nên không bị ghi đè ở đây.
 */
export async function upsertPage(data: PageFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsedData = pageSchema.parse(data)
    const { id, content, ...fields } = parsedData
    const slug = fields.slug.trim().toLowerCase()

    if (!PAGE_SLUG_RE.test(slug)) {
      return { success: false, error: "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang" }
    }

    if (id) {
      const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } })
      if (!existing || existing.slug === SITE_SETTINGS_SLUG) return { success: false, error: "Không tìm thấy trang" }
      if (existing.slug === HOME_PAGE_SLUG && slug !== HOME_PAGE_SLUG) {
        return { success: false, error: "Không thể đổi slug của trang chủ" }
      }
      if (slug !== existing.slug && isReservedSlug(slug)) {
        return { success: false, error: `Slug "${slug}" đã được hệ thống sử dụng` }
      }

      await prisma.page.update({
        where: { id },
        data: {
          ...fields,
          slug,
          ...(content !== undefined && content !== "" ? { content } : {}),
        },
      })
      revalidatePath(getPublicPagePath(existing.slug))
      revalidatePath(getPublicPagePath(slug))
    } else {
      if (isReservedSlug(slug)) return { success: false, error: `Slug "${slug}" đã được hệ thống sử dụng` }
      const page = await prisma.page.create({
        data: { ...fields, slug, content: content || serializePageDocument(emptyDocument()) },
      })
      revalidatePath("/admin/cms/pages")
      return { success: true, id: page.id }
    }

    revalidatePath("/admin/cms/pages")
    return { success: true, id }
  } catch (error: unknown) {
    console.error("Page upsert error:", error)
    if (isPrismaUniqueError(error)) {
      return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deletePage(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } })
    if (!existing || existing.slug === SITE_SETTINGS_SLUG) return { success: false, error: "Không thể xóa trang này" }
    if (existing.slug === HOME_PAGE_SLUG) return { success: false, error: "Không thể xoá trang chủ" }
    await prisma.page.delete({ where: { id } })
    revalidatePath(getPublicPagePath(existing.slug))
    revalidatePath("/admin/cms/pages")
    return { success: true }
  } catch (error: unknown) {
    console.error("Page delete error:", error)
    return { success: false, error: "Không thể xóa trang này" }
  }
}
