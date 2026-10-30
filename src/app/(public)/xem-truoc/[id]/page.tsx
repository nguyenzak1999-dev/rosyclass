import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Eye } from "lucide-react"
import { PageBlocks } from "@/components/page-builder/block-renderer"
import { getCurrentAdminUser, hasPermission, PERMISSIONS } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import { getPublicPagePath, isPublicStatus, isSystemPageSlug } from "@/lib/page-builder/constants"
import { parsePageDocument, visibleBlocks } from "@/lib/page-builder/document"
import { enablePagePreview, loadDataForBlocks } from "@/lib/page-builder/pages"
import { SYSTEM_PAGE_ROUTES } from "./system-pages"

// Bản xem trước của admin: luôn dựng mới, không vào cache trang công khai, không cho lập chỉ mục
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Xem trước trang",
  robots: { index: false, follow: false, nocache: true },
}

/** Trang dựng bằng page builder hiển thị y như trên website, lấy bản nháp mới nhất (chưa xuất bản) */
export default async function PagePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentAdminUser()
  if (!user) redirect(`/admin-login?next=${encodeURIComponent(`/admin/cms/pages/${id}/builder`)}`)
  if (!hasPermission(user, PERMISSIONS.cmsRead)) notFound()

  const page = await prisma.page.findUnique({ where: { id }, select: { slug: true, status: true, content: true } })
  if (!page || page.slug === SITE_SETTINGS_SLUG) notFound()

  const doc = parsePageDocument(page.content)
  const blocks = visibleBlocks(doc.draft?.blocks ?? doc.blocks)
  const published = isPublicStatus(page.status)
  const systemSlug = isSystemPageSlug(page.slug) ? page.slug : null
  // Trang hệ thống: dựng chính route của trang, route đọc bản nháp nhờ cờ xem trước của request này
  if (systemSlug) enablePagePreview()
  const SystemRoute = systemSlug ? SYSTEM_PAGE_ROUTES[systemSlug] : null
  const data = SystemRoute ? null : await loadDataForBlocks(blocks)

  return (
    <>
      <div className="sticky top-20 z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-y border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
        <Eye className="h-4 w-4" aria-hidden="true" />
        <span>
          Bản xem trước {doc.draft ? "(bản nháp)" : ""} – chỉ admin thấy.{" "}
          {published ? (doc.draft ? "Website vẫn đang hiển thị bản đã xuất bản." : "Trang đang hiển thị trên website.") : "Trang chưa xuất bản."}
        </span>
        <Link href={`/admin/cms/pages/${id}/builder`} className="underline underline-offset-2">
          Về trình thiết kế
        </Link>
        {published ? (
          <Link href={getPublicPagePath(page.slug)} className="underline underline-offset-2">
            Xem bản trên website
          </Link>
        ) : null}
      </div>
      {SystemRoute ? (
        <SystemRoute />
      ) : blocks.length === 0 || !data ? (
        <p className="px-4 py-24 text-center text-kid-ink-soft">Trang chưa có khối nào đang hiển thị.</p>
      ) : (
        <PageBlocks blocks={blocks} data={data} className="pb-10" />
      )}
    </>
  )
}
