import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react"
import ParentDetailClient from "./parent-detail-client"
import { ParentAccessLinks } from "./components/parent-access-links"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { formatVietnamDate } from "@/lib/curriculum"

export default async function ParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAdminUser()
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          classStudents: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  course: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { fullName: "asc" },
      },
    },
  })

  if (!parent) {
    return notFound()
  }

  // Lấy tất cả HV ACTIVE chưa có PH (hoặc chưa có PH hiện tại) để cho phép thêm
  const availableStudents = await prisma.student.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { parentId: null },
        { parentId: { not: parent.id } },
      ],
    },
    select: { id: true, fullName: true, phone: true, currentLevel: true },
    orderBy: { fullName: "asc" },
  })

  // Lấy payments của các con
  const studentIds = parent.students.map((s) => s.id)
  const payments = studentIds.length > 0
    ? await prisma.payment.findMany({
        where: {
          studentId: { in: studentIds },
        },
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { id: true, fullName: true } },
          class: { select: { name: true } },
          course: { select: { name: true } },
        },
      })
    : []

  const now = new Date()
  const accessTokens = await prisma.parentAccessToken.findMany({
    where: { parentId: parent.id, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    include: { createdBy: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  })
  const dateTime = { hour: "2-digit", minute: "2-digit" } as const

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/parents" />}>
          <ArrowLeft className="h-4 h-4" />
        </Button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {parent.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{parent.fullName}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
              {parent.relationship && (
                <span className="px-2 py-0.5 bg-muted rounded text-xs">
                  {parent.relationship}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {parent.phone}
              </span>
              {parent.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {parent.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ParentAccessLinks
        parentId={parent.id}
        parentName={parent.fullName}
        childNames={parent.students.map((student) => student.fullName)}
        canWrite={hasPermission(user, PERMISSIONS.parentsWrite)}
        links={accessTokens.map((token) => ({
          id: token.id,
          label: token.label,
          createdLabel: formatVietnamDate(token.createdAt, dateTime),
          createdBy: token.createdBy?.fullName ?? null,
          expiresLabel: token.expiresAt ? formatVietnamDate(token.expiresAt) : null,
          lastUsedLabel: token.lastUsedAt ? formatVietnamDate(token.lastUsedAt, dateTime) : null,
        }))}
      />

      <ParentDetailClient
        parent={JSON.parse(JSON.stringify(parent))}
        availableStudents={JSON.parse(JSON.stringify(availableStudents))}
        payments={JSON.parse(JSON.stringify(payments))}
      />
    </div>
  )
}
