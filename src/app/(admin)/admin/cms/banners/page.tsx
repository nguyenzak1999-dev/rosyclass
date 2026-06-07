import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { BannerDialog } from "./components/banner-dialog"
import { columns } from "./components/columns"

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [
      { position: "asc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Hero/Banner</h1>
        <BannerDialog totalBanners={banners.length} />
      </div>

      <DataTable
        columns={columns}
        data={banners}
        searchKey="title"
        searchPlaceholder="Tìm hero theo tiêu đề..."
      />
    </div>
  )
}
