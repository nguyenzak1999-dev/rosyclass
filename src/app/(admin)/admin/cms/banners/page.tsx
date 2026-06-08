import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { BannerDialog } from "./components/banner-dialog"
import { BannerFilters } from "./components/banner-filters"
import { columns } from "./components/columns"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    isActive?: string
  }>
}

export default async function BannersPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.BannerWhereInput = {}
  if (filters.isActive === "true") {
    where.isActive = true
  } else if (filters.isActive === "false") {
    where.isActive = false
  }

  const banners = await prisma.banner.findMany({
    where,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  })

  const stats = {
    total: banners.length,
    active: banners.filter((b) => b.isActive).length,
    inactive: banners.filter((b) => !b.isActive).length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Hero/Banner</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} banner · {stats.active} đang hiện · {stats.inactive} đã ẩn
          </p>
        </div>
        <BannerDialog totalBanners={banners.length} />
      </div>

      <BannerFilters currentIsActive={filters.isActive || ""} />

      <DataTable
        columns={columns}
        data={banners}
        searchKey="title"
        searchPlaceholder="Tìm hero theo tiêu đề..."
      />
    </div>
  )
}
