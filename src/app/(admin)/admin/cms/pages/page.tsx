import Link from "next/link"
import { LayoutTemplate } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import { HOME_PAGE_SLUG } from "@/lib/page-builder/constants"
import { columns } from "./components/columns"
import { PageDialog } from "./components/page-dialog"

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    // Page "site-settings" chỉ dùng để lưu cấu hình website, không hiển thị ở đây
    where: { slug: { not: SITE_SETTINGS_SLUG } },
    select: { id: true, title: true, slug: true, status: true, seoTitle: true, seoDescription: true, createdAt: true },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Trang chủ luôn ở đầu danh sách
  const sorted = [...pages].sort((a, b) => Number(b.slug === HOME_PAGE_SLUG) - Number(a.slug === HOME_PAGE_SLUG))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Trang nội dung</h1>
          <p className="text-sm text-muted-foreground">Thiết kế trang bằng các khối kéo thả, xuất bản tại rosyclass.edu.vn/slug.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/cms/home" />}>
            <LayoutTemplate /> Thiết kế trang chủ
          </Button>
          <PageDialog />
        </div>
      </div>

      <DataTable columns={columns} data={sorted} searchKey="title" searchPlaceholder="Tìm kiếm trang theo tiêu đề..." />
    </div>
  )
}
