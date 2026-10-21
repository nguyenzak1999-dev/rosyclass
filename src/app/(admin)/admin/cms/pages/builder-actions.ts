"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import {
  HOME_PAGE_SLUG,
  getPublicPagePath,
  isPublicStatus,
  isReservedSlug,
  type PageStatus,
} from "@/lib/page-builder/constants"
import { buildStarterBlocks } from "@/lib/page-builder/defaults"
import { parsePageDocument, serializePageDocument, validateBlocks, type PageDocument } from "@/lib/page-builder/document"
import { pageMetaSchema, type PageMetaInput } from "@/lib/page-builder/meta"

type ActionResult<T = object> = ({ success: true } & T) | { success: false; error: string }

export interface SavedPageState {
  status: PageStatus
  hasDraft: boolean
  slug: string
  updatedAt: string
}

function revalidatePagePaths(...slugs: string[]) {
  for (const slug of new Set(slugs)) revalidatePath(getPublicPagePath(slug))
  revalidatePath("/admin/cms/pages")
}

function slugError(slug: string, currentSlug?: string) {
  if (slug === currentSlug) return null
  if (isReservedSlug(slug)) return `Slug "${slug}" đã được hệ thống sử dụng, vui lòng chọn slug khác`
  return null
}

/**
 * Lưu trang từ builder.
 * - "publish": nội dung builder trở thành bản công khai, trạng thái PUBLISHED
 * - "draft": nếu trang đang công khai thì lưu vào bản nháp (bản công khai giữ nguyên),
 *   ngược lại lưu nội dung và đặt trạng thái DRAFT
 */
export async function savePageBuilder(input: {
  id: string
  meta: PageMetaInput
  blocks: unknown
  mode: "draft" | "publish"
}): Promise<ActionResult<{ page: SavedPageState }>> {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)

    const id = z.string().min(1).parse(input.id)
    const mode = z.enum(["draft", "publish"]).parse(input.mode)
    const metaResult = pageMetaSchema.safeParse(input.meta)
    if (!metaResult.success) {
      return { success: false, error: metaResult.error.issues[0]?.message || "Thông tin trang không hợp lệ" }
    }
    const blocksResult = validateBlocks(input.blocks)
    if (!blocksResult.success) return { success: false, error: blocksResult.error }

    const existing = await prisma.page.findUnique({ where: { id } })
    if (!existing || existing.slug === SITE_SETTINGS_SLUG) {
      return { success: false, error: "Không tìm thấy trang" }
    }

    const meta = metaResult.data
    const isHome = existing.slug === HOME_PAGE_SLUG
    // Trang chủ luôn giữ slug hệ thống
    const slug = isHome ? HOME_PAGE_SLUG : meta.slug
    const conflict = slugError(slug, existing.slug)
    if (conflict) return { success: false, error: conflict }

    const current = parsePageDocument(existing.content)
    let doc: PageDocument
    let status = existing.status as PageStatus

    if (mode === "publish") {
      doc = { version: 1, blocks: blocksResult.blocks }
      status = "PUBLISHED"
    } else if (isPublicStatus(existing.status)) {
      doc = { version: 1, blocks: current.blocks, draft: { blocks: blocksResult.blocks, savedAt: new Date().toISOString() } }
    } else {
      doc = { version: 1, blocks: blocksResult.blocks }
      status = "DRAFT"
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        title: meta.title,
        slug,
        seoTitle: meta.seoTitle || null,
        seoDescription: meta.seoDescription || null,
        content: serializePageDocument(doc),
        status,
      },
    })

    revalidatePagePaths(existing.slug, updated.slug)
    revalidatePath(`/admin/cms/pages/${id}/builder`)

    return {
      success: true,
      page: {
        status: updated.status as PageStatus,
        hasDraft: Boolean(doc.draft),
        slug: updated.slug,
        updatedAt: updated.updatedAt.toISOString(),
      },
    }
  } catch (error) {
    console.error("Save page builder error:", error)
    if (isPrismaUniqueError(error)) return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    return { success: false, error: getErrorMessage(error, "Không thể lưu trang") }
  }
}

/** Gỡ trang khỏi website: chuyển về DRAFT, giữ nội dung mới nhất (bản nháp nếu có) */
export async function unpublishPage(id: string): Promise<ActionResult<{ page: SavedPageState }>> {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const existing = await prisma.page.findUnique({ where: { id: z.string().min(1).parse(id) } })
    if (!existing || existing.slug === SITE_SETTINGS_SLUG) return { success: false, error: "Không tìm thấy trang" }

    const current = parsePageDocument(existing.content)
    const doc: PageDocument = { version: 1, blocks: current.draft?.blocks ?? current.blocks }
    const updated = await prisma.page.update({
      where: { id: existing.id },
      data: { status: "DRAFT", content: serializePageDocument(doc) },
    })

    revalidatePagePaths(existing.slug)
    return {
      success: true,
      page: { status: "DRAFT", hasDraft: false, slug: updated.slug, updatedAt: updated.updatedAt.toISOString() },
    }
  } catch (error) {
    console.error("Unpublish page error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể gỡ xuất bản trang") }
  }
}

/** Tạo trang mới (nháp) với vài khối khởi đầu rồi mở builder */
export async function createBuilderPage(input: { title: string; slug: string }): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = pageMetaSchema.pick({ title: true, slug: true }).safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Thông tin trang không hợp lệ" }
    }
    const conflict = slugError(parsed.data.slug)
    if (conflict) return { success: false, error: conflict }

    const page = await prisma.page.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: serializePageDocument({ version: 1, blocks: buildStarterBlocks(parsed.data.title) }),
        status: "DRAFT",
      },
    })

    revalidatePath("/admin/cms/pages")
    return { success: true, id: page.id }
  } catch (error) {
    console.error("Create builder page error:", error)
    if (isPrismaUniqueError(error)) return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    return { success: false, error: getErrorMessage(error, "Không thể tạo trang") }
  }
}
