import { prisma } from "@/lib/prisma"
import { ParentsClient } from "./components/parents-client"

export default async function ParentsPage() {
  const parents = await prisma.parent.findMany({
    include: {
      students: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const students = await prisma.student.findMany({
    orderBy: {
      fullName: 'asc'
    }
  })

  return <ParentsClient parents={parents} students={students} />
}
