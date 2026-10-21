import Link from "next/link"
import { redirect } from "next/navigation"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { getOrCreateHomePageId } from "@/lib/page-builder/admin"

export const dynamic = "force-dynamic"

/** Mở page builder của trang chủ, tạo trang chủ từ cấu hình cũ nếu chưa có */
export default async function HomeCmsPage() {
  const user = await requireAdminUser()
  const canWrite = hasPermission(user, PERMISSIONS.cmsWrite)
  const id = await getOrCreateHomePageId({ create: canWrite })

  if (id) redirect(`/admin/cms/pages/${id}/builder`)

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Trang chủ chưa được thiết kế</h1>
      <p className="text-sm text-muted-foreground">
        Bạn cần quyền chỉnh sửa CMS để tạo trang chủ bằng trình thiết kế. Website hiện vẫn hiển thị trang chủ mặc định.
      </p>
      <Link href="/admin/cms/pages" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Về danh sách trang
      </Link>
    </div>
  )
}
