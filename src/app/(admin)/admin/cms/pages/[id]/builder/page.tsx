import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { getSiteSettings } from "@/lib/get-site-settings"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import { HOME_PAGE_SLUG, PAGE_STATUSES, type PageStatus } from "@/lib/page-builder/constants"
import { parsePageDocument } from "@/lib/page-builder/document"
import { ALL_DATA_NEEDS, loadBlockData } from "@/lib/page-builder/data"
import { PageBuilderEditor } from "./components/page-builder-editor"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Thiết kế trang",
}

export default async function PageBuilderRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, page] = await Promise.all([requireAdminUser(), prisma.page.findUnique({ where: { id } })])

  if (!page || page.slug === SITE_SETTINGS_SLUG) notFound()

  const doc = parsePageDocument(page.content)
  // Dữ liệu xem trước cho mọi khối dữ liệu, vì admin có thể thêm khối bất kỳ
  const data = await loadBlockData(ALL_DATA_NEEDS, getSiteSettings)
  const status: PageStatus = (PAGE_STATUSES as readonly string[]).includes(page.status) ? (page.status as PageStatus) : "DRAFT"

  return (
    <PageBuilderEditor
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        status,
        isHome: page.slug === HOME_PAGE_SLUG,
      }}
      initialBlocks={doc.draft?.blocks ?? doc.blocks}
      initialHasDraft={Boolean(doc.draft)}
      data={data}
      canWrite={hasPermission(user, PERMISSIONS.cmsWrite)}
    />
  )
}
