import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { BannerForm } from "../components/banner-form"

export const dynamic = "force-dynamic"

export default async function NewBannerPage() {
  const totalBanners = await prisma.banner.count()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/admin/cms/banners" />}>
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm Hero mới</h1>
        <p className="text-sm text-muted-foreground">
          Tạo banner hiển thị trên trang chủ, gồm ảnh nền, nội dung và nút CTA.
        </p>
      </div>

      <BannerForm totalBanners={totalBanners} />
    </div>
  )
}
