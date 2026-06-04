import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { BannerDialog } from "../banners/components/banner-dialog"
import { columns } from "../banners/components/columns"
import { getSiteSettings } from "@/lib/get-site-settings"
import { HeroSettingsForm } from "./components/hero-settings-form"

export default async function HeroCmsPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [
      {
        position: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  })
  const settings = await getSiteSettings()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Hero trang chủ</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các slide Hero hiển thị ở đầu trang chủ. Slide đang bật sẽ tự chạy theo thứ tự vị trí.
          </p>
        </div>
        <BannerDialog />
      </div>

      <DataTable
        columns={columns}
        data={banners}
        searchKey="title"
        searchPlaceholder="Tìm kiếm hero theo tiêu đề..."
      />

      <HeroSettingsForm settings={settings} />
    </div>
  )
}
