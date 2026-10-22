import "server-only"

import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getParentSession, type ParentSession } from "@/lib/auth/parent-session"

// Mọi truy vấn của cổng phụ huynh đều đi qua đây: lọc theo parentId lấy từ cookie đã xác thực,
// không bao giờ tin studentId/parentId từ URL hay form.

export async function requireParentSession(): Promise<ParentSession> {
  const session = await getParentSession()
  if (!session) redirect("/phu-huynh")
  return session
}

/** Bé thuộc phụ huynh đang đăng nhập; không phải con của phụ huynh này thì 404 */
export async function requireParentChild(studentId: string) {
  const session = await requireParentSession()
  const student = await prisma.student.findFirst({
    where: { id: studentId, parentId: session.parentId },
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
      classStudents: {
        where: { status: "ACTIVE" },
        select: {
          class: {
            select: {
              id: true,
              name: true,
              course: { select: { name: true } },
              teacher: { select: { fullName: true } },
            },
          },
        },
      },
    },
  })
  if (!student) notFound()
  return { session, student }
}
