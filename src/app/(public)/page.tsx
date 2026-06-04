import { prisma } from "@/lib/prisma"
import HomeClient from "./home-client"
import { getSiteSettings } from "@/lib/get-site-settings"

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      isPublished: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const settings = await getSiteSettings();

  return <HomeClient courses={courses} settings={settings} />
}
