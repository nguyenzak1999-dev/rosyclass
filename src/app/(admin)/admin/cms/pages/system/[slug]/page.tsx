import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { DESIGNABLE_SYSTEM_PAGES, isSystemPageSlug } from "@/lib/page-builder/constants"
import { getOrCreateSystemPageId } from "@/lib/page-builder/admin"

export const dynamic = "force-dynamic"

/** Mở page builder của một trang hệ thống, tạo bản thiết kế (nháp) nếu chưa có */
export default async function SystemPageDesign({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isSystemPageSlug(slug)) notFound()
  const user = await requireAdminUser()
  const id = await getOrCreateSystemPageId(slug, { create: hasPermission(user, PERMISSIONS.cmsWrite) })

  if (id) redirect(`/admin/cms/pages/${id}/builder`)

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Trang “{DESIGNABLE_SYSTEM_PAGES[slug].title}” chưa được thiết kế</h1>
      <p className="text-sm text-muted-foreground">
        Bạn cần quyền chỉnh sửa CMS để thiết kế trang này. Website hiện vẫn hiển thị trang mặc định.
      </p>
      <Link href="/admin/cms/pages" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Về danh sách trang
      </Link>
    </div>
  )
}
