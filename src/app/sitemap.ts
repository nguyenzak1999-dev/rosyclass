import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { PUBLIC_PAGE_STATUSES, isReservedSlug } from "@/lib/page-builder/constants"

export const dynamic = "force-dynamic"

const staticRoutes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/khoa-hoc", changeFrequency: "weekly", priority: 0.9 },
  { path: "/lich-khai-giang", changeFrequency: "weekly", priority: 0.85 },
  { path: "/kiem-tra-trinh-do", changeFrequency: "monthly", priority: 0.8 },
  { path: "/dang-ky", changeFrequency: "monthly", priority: 0.8 },
  { path: "/giao-vien", changeFrequency: "monthly", priority: 0.75 },
  { path: "/ve-chung-toi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/goc-hoc-tap", changeFrequency: "weekly", priority: 0.7 },
  { path: "/hoi-dap", changeFrequency: "monthly", priority: 0.65 },
  { path: "/lien-he", changeFrequency: "monthly", priority: 0.65 },
  { path: "/chinh-sach-bao-mat", changeFrequency: "yearly", priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        slug: true,
        thumbnail: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    })

    routes.push(
      ...posts.map((post) => ({
        url: absoluteUrl(`/goc-hoc-tap/${post.slug}`),
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
      }))
    )

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        status: {
          in: ["ACTIVE", "PUBLISHED"],
        },
      },
      select: {
        slug: true,
        thumbnail: true,
        updatedAt: true,
      },
    })

    routes.push(
      ...courses.map((course) => ({
        url: absoluteUrl(`/khoa-hoc/${course.slug}`),
        lastModified: course.updatedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
        images: course.thumbnail ? [absoluteUrl(course.thumbnail)] : undefined,
      }))
    )

    const teachers = await prisma.teacher.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        avatar: true,
        updatedAt: true,
      },
    })

    routes.push(
      ...teachers.map((teacher) => ({
        url: absoluteUrl(`/giao-vien/${teacher.id}`),
        lastModified: teacher.updatedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.55,
        images: teacher.avatar ? [absoluteUrl(teacher.avatar)] : undefined,
      }))
    )

    // Trang tuỳ chỉnh dựng bằng page builder (trang chủ đã có ở "/")
    const pages = await prisma.page.findMany({
      where: {
        status: {
          in: [...PUBLIC_PAGE_STATUSES],
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    routes.push(
      ...pages
        .filter((page) => !isReservedSlug(page.slug))
        .map((page) => ({
          url: absoluteUrl(`/${page.slug}`),
          lastModified: page.updatedAt || now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
    )
  } catch (error) {
    console.error("Unable to build dynamic sitemap entries:", error)
  }

  return routes
}
