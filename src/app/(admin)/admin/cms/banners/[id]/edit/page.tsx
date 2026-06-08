import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { BannerForm } from "../../components/banner-form"

export const dynamic = "force-dynamic"

interface EditBannerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params
  const [banner, totalBanners] = await Promise.all([
    prisma.banner.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        buttonText: true,
        buttonUrl: true,
        position: true,
        isActive: true,
      },
    }),
    prisma.banner.count(),
  ])

  if (!banner) notFound()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/admin/cms/banners" />}>
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa Hero</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật ảnh nền, nội dung, CTA, thứ tự hiển thị và trạng thái của banner.
        </p>
      </div>

      <BannerForm banner={banner} totalBanners={totalBanners} />
    </div>
  )
}
