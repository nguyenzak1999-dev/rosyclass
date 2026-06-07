import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import CoursesClient from "./courses-client"

export const metadata: Metadata = createPageMetadata({
  title: "Khóa học tiếng Anh",
  description: "Khám phá các khóa học tiếng Anh tại RosyClass: tiếng Anh trẻ em, giao tiếp, IELTS và lộ trình cá nhân hóa theo trình độ.",
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
