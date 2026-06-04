import { prisma } from "@/lib/prisma"
import { ClassesClient } from "./components/classes-client"

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      course: true,
      teacher: true,
      branch: true,
    }
  })

  const courses = await prisma.course.findMany({
    select: { id: true, name: true }
  })

  return <ClassesClient classes={classes} courses={courses} />
}
