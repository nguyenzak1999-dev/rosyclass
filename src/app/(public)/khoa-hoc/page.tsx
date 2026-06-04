import { prisma } from "@/lib/prisma"
import CoursesClient from "./courses-client"

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
