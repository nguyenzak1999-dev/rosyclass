import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import CoursesClient from "./courses-client"

export const metadata: Metadata = createPageMetadata({
  title: "Khóa học tiếng Anh",
  description: "Các chương trình tiếng Anh cho bé tại RosyClass: Mầm non (3–5 tuổi), Tiểu học lớp 1–2, lớp 3–5, Cambridge Starters – Movers – Flyers và kèm 1–1 cho bé.",
  path: "/khoa-hoc",
})

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      isPublished: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return <CoursesClient courses={courses} />
}
