import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Phone, Mail, Calendar } from "lucide-react"
import { formatVietnam } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import { BadgeStatus } from "@/components/ui/badge-status"
import LeadDetailClient from "./lead-detail-client"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      interestedCourse: { select: { id: true, name: true, level: true, slug: true, isPublished: true } },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      leadNotes: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, fullName: true } },
        },
      },
      placementTests: {
        orderBy: { testDate: "desc" },
      },
    },
  })

  if (!lead) {
    return notFound()
  }

  // Lấy tất cả parents cho combobox Convert to Student
  const parents = await prisma.parent.findMany({
    select: { id: true, fullName: true, phone: true },
    orderBy: { fullName: "asc" },
  })

  // Lấy courses ACTIVE cho combobox Suggested Course
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, level: true },
    orderBy: { name: "asc" },
  })

  // Build activity timeline (notes + status changes)
  type TimelineItem = {
    id: string
    type: "NOTE" | "STATUS" | "PLACEMENT_TEST" | "CREATED"
    date: string | Date
    title: string
    description?: string
    actorName?: string
  }
  type RawTimelineItem = {
    id: string
    type: "NOTE" | "STATUS" | "PLACEMENT_TEST" | "CREATED"
    date: Date
    title: string
    description?: string
    actorName?: string
  }
  const rawTimeline: RawTimelineItem[] = [
    {
      id: `created-${lead.id}`,
      type: "CREATED",
      date: lead.createdAt,
      title: "Lead được tạo",
      description: lead.source ? `Nguồn: ${lead.source}` : undefined,
    },
    ...lead.placementTests.map((t) => ({
      id: `pt-${t.id}`,
      type: "PLACEMENT_TEST" as const,
      date: t.testDate,
      title: `Đặt lịch Placement Test`,
      description: t.teacherComment || undefined,
    })),
    ...lead.leadNotes.map((n) => ({
      id: `note-${n.id}`,
      type: "NOTE" as const,
      date: n.createdAt,
      title: n.content.startsWith("[Status:")
        ? n.content.split("]")[0].replace("[Status:", "").trim()
        : "Ghi chú tư vấn",
      description: n.content.startsWith("[Status:")
        ? n.content.split("]").slice(1).join("]").trim()
        : n.content,
      actorName: n.createdBy?.fullName || undefined,
    })),
  ]
  const timeline: TimelineItem[] = rawTimeline
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((item) => ({ ...item, date: item.date.toISOString() as unknown as Date }))

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/leads" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">{lead.fullName}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {lead.phone}
            </span>
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {lead.email}
              </span>
            )}
            {lead.age && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {lead.age} tuổi
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatVietnam(lead.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
            </span>
          </div>
        </div>
        <BadgeStatus status={lead.status} />
      </div>

      <LeadDetailClient
        lead={JSON.parse(JSON.stringify(lead))}
        timeline={JSON.parse(JSON.stringify(timeline))}
        parents={parents}
        courses={JSON.parse(JSON.stringify(courses))}
      />
    </div>
  )
}
