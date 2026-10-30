import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import CoursesClient from "./courses-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("khoa-hoc", {
    title: "Khóa học tiếng Anh",
    description: "Các chương trình tiếng Anh cho bé tại RosyClass: Mầm non (3–5 tuổi), Tiểu học lớp 1–2, lớp 3–5, Cambridge Starters – Movers – Flyers và kèm 1–1 cho bé.",
    path: "/khoa-hoc",
  })
}

async function CoursesPageContent() {
  // Cùng điều kiện với trang chi tiết /khoa-hoc/[slug] và sitemap: khoá học mặc định ở trạng thái ACTIVE
  const courses = await prisma.course.findMany({
    where: {
      status: { in: ["ACTIVE", "PUBLISHED"] },
      isPublished: true
    },
    select: {
      id: true,
      slug: true,
      name: true,
      level: true,
      description: true,
      targetAudience: true,
      learningOutcomes: true,
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return <CoursesClient courses={courses} />
}

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function CoursesPage() {
  return (
    <DesignedPage slug="khoa-hoc">
      <CoursesPageContent />
    </DesignedPage>
  )
}
