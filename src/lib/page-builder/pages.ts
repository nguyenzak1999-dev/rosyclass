import "server-only"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import { HOME_PAGE_SLUG, PAGE_SLUG_RE, PUBLIC_PAGE_STATUSES, isReservedSlug, type SystemPageSlug } from "./constants"
import { buildDefaultHomeBlocks } from "./defaults"
import { parsePageDocument, visibleBlocks, type Block } from "./document"
import { collectDataNeeds, loadBlockData, safeQuery } from "./data"
import type { PageBuilderData } from "./types"

export interface RenderablePage {
  title: string
  slug: string
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: Date
  blocks: Block[]
}

/** Lấy Page đang hiển thị công khai theo slug (cache theo request) */
const getPublicPageRecord = cache(async (slug: string) =>
  safeQuery(
    `trang ${slug}`,
    () =>
      prisma.page.findFirst({
        where: { slug, status: { in: [...PUBLIC_PAGE_STATUSES] } },
        select: { title: true, slug: true, content: true, seoTitle: true, seoDescription: true, updatedAt: true },
      }),
    null
  )
)

/** Trang tuỳ chỉnh công khai cho route /[slug]. Slug hệ thống/không hợp lệ → null. */
export const getPublishedCustomPage = cache(async (slug: string): Promise<RenderablePage | null> => {
  if (!PAGE_SLUG_RE.test(slug) || isReservedSlug(slug)) return null
  const record = await getPublicPageRecord(slug)
  if (!record) return null
  const doc = parsePageDocument(record.content)
  return {
    title: record.title,
    slug: record.slug,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    updatedAt: record.updatedAt,
    blocks: visibleBlocks(doc.blocks),
  }
})

/**
 * Block của trang chủ: Page "trang-chu" nếu đã xuất bản và có nội dung,
 * ngược lại dựng từ các field trang chủ cũ trong SiteSettings.
 */
export async function getHomeBlocks(): Promise<Block[]> {
  const record = await getPublicPageRecord(HOME_PAGE_SLUG)
  if (record) {
    const blocks = visibleBlocks(parsePageDocument(record.content).blocks)
    if (blocks.length > 0) return blocks
  }
  return buildDefaultHomeBlocks(await getSiteSettings())
}

/** Trang tự tạo hiện trên menu website (tối đa 3 để menu máy tính không tràn) */
export async function getMenuPages(): Promise<{ name: string; href: string }[]> {
  const pages = await safeQuery(
    "trang trên menu",
    () =>
      prisma.page.findMany({
        where: { showInMenu: true, status: { in: [...PUBLIC_PAGE_STATUSES] } },
        select: { title: true, slug: true },
        orderBy: { createdAt: "asc" },
        take: 10,
      }),
    []
  )
  return pages
    .filter((page) => PAGE_SLUG_RE.test(page.slug) && !isReservedSlug(page.slug))
    .slice(0, 3)
    .map((page) => ({ name: page.title, href: `/${page.slug}` }))
}

/** Cờ xem trước theo request: trang /xem-truoc bật lên để trang hệ thống dựng từ bản nháp */
const previewRequest = cache(() => ({ enabled: false }))

export function enablePagePreview() {
  previewRequest().enabled = true
}

/**
 * Bản thiết kế page builder của một trang hệ thống (Khóa học, Liên hệ…): bản đã xuất bản,
 * hoặc bản nháp mới nhất khi đang xem trước. null = hiển thị trang mặc định.
 */
export const getSystemPageDesign = cache(async (slug: SystemPageSlug) => {
  const preview = previewRequest().enabled
  const record = preview
    ? await safeQuery(
        `trang ${slug}`,
        () =>
          prisma.page.findUnique({
            where: { slug },
            select: { content: true, seoTitle: true, seoDescription: true },
          }),
        null
      )
    : await getPublicPageRecord(slug)
  if (!record) return null
  const doc = parsePageDocument(record.content)
  const blocks = visibleBlocks(preview ? (doc.draft?.blocks ?? doc.blocks) : doc.blocks)
  if (blocks.length === 0) return null
  return { blocks, seoTitle: record.seoTitle, seoDescription: record.seoDescription }
})

export async function loadDataForBlocks(blocks: Block[]): Promise<PageBuilderData> {
  return loadBlockData(collectDataNeeds(blocks), getSiteSettings)
}
