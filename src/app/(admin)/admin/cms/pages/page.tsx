import Link from "next/link"
import { ExternalLink, LayoutTemplate, Paintbrush } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"
import {
  DESIGNABLE_SYSTEM_PAGES,
  HOME_PAGE_SLUG,
  SYSTEM_PAGE_SLUGS_LIST,
  getPublicPagePath,
  isSystemPageSlug,
  type PageStatus,
} from "@/lib/page-builder/constants"
import { columns } from "./components/columns"
import { PageDialog } from "./components/page-dialog"
import { StatusBadge } from "./[id]/builder/components/status-badge"

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    // Page "site-settings" chỉ dùng để lưu cấu hình website, không hiển thị ở đây
    where: { slug: { not: SITE_SETTINGS_SLUG } },
    select: { id: true, title: true, slug: true, status: true, seoTitle: true, seoDescription: true, createdAt: true },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Trang chủ luôn ở đầu danh sách, trang hệ thống quản lý ở khối riêng phía trên
  const sorted = pages
    .filter((page) => !isSystemPageSlug(page.slug))
    .sort((a, b) => Number(b.slug === HOME_PAGE_SLUG) - Number(a.slug === HOME_PAGE_SLUG))
  const systemPages = new Map(pages.filter((page) => isSystemPageSlug(page.slug)).map((page) => [page.slug, page]))

  return (
    <div className="flex flex-col gap-6">
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

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Trang hệ thống</h2>
          <p className="text-sm text-muted-foreground">
            Các trang có sẵn của website. Bấm “Thiết kế” để thêm, bớt, sắp xếp khối quanh phần chức năng của trang (danh sách,
            form…). Chưa xuất bản thì website vẫn hiển thị trang mặc định.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SYSTEM_PAGE_SLUGS_LIST.map((slug) => {
            const info = DESIGNABLE_SYSTEM_PAGES[slug]
            const page = systemPages.get(slug)
            return (
              <div key={slug} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{info.title}</p>
                    <p className="text-xs text-muted-foreground">/{slug} · {info.content}</p>
                  </div>
                  {page ? (
                    <StatusBadge status={page.status as PageStatus} />
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">Mặc định</span>
                  )}
                </div>
                <div className="mt-auto flex gap-2">
                  <Button size="sm" render={<Link href={`/admin/cms/pages/system/${slug}`} />}>
                    <Paintbrush /> Thiết kế
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    render={<a href={getPublicPagePath(slug)} target="_blank" rel="noopener noreferrer" />}
                  >
                    <ExternalLink /> Trên web
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Trang tự tạo</h2>
        <DataTable columns={columns} data={sorted} searchKey="title" searchPlaceholder="Tìm kiếm trang theo tiêu đề..." />
      </section>
    </div>
  )
}
