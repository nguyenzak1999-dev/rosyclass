import "server-only"

import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import type { SystemPageSlug } from "@/lib/page-builder/constants"
import { getSystemPageDesign, loadDataForBlocks } from "@/lib/page-builder/pages"
import { PageBlocks } from "./block-renderer"

/**
 * Trang hệ thống (Khóa học, Liên hệ…) có thể thiết kế lại trong CMS bằng page builder.
 * Có bản thiết kế: dựng các khối, phần chức năng của trang (children) nằm ở khối "Nội dung chính của trang".
 * Chưa có: hiển thị trang mặc định như cũ.
 */
export async function DesignedPage({ slug, children }: { slug: SystemPageSlug; children: React.ReactNode }) {
  const design = await getSystemPageDesign(slug)
  if (!design) return <>{children}</>
  const data = await loadDataForBlocks(design.blocks)
  return <PageBlocks blocks={design.blocks} data={data} mainContent={children} className="pb-10" />
}

/** SEO của trang hệ thống: tiêu đề/mô tả nhập trong page builder (nếu có) thay cho mặc định */
export async function designedPageMetadata(
  slug: SystemPageSlug,
  input: Parameters<typeof createPageMetadata>[0]
): Promise<Metadata> {
  const design = await getSystemPageDesign(slug)
  return createPageMetadata({
    ...input,
    title: design?.seoTitle || input.title,
    description: design?.seoDescription || input.description,
  })
}
