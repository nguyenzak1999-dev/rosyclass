import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import HomeCmsClient from "./client"

export default async function HomeCmsPage() {
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

  return <HomeCmsClient banners={banners} settings={settings} />
}
