import "server-only"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import { HOME_PAGE_SLUG, PAGE_SLUG_RE, PUBLIC_PAGE_STATUSES, isReservedSlug } from "./constants"
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

export async function loadDataForBlocks(blocks: Block[]): Promise<PageBuilderData> {
  return loadBlockData(collectDataNeeds(blocks), getSiteSettings)
}
