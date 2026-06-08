import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { LeadDialog } from "./components/lead-dialog"
import { LeadFilters } from "./components/lead-filters"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    status?: string
    source?: string
    assignedToId?: string
  }>
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.LeadWhereInput = {}
  if (filters.status) {
    where.status = filters.status as Prisma.EnumLeadStatusFilter
  }
  if (filters.source) {
    where.source = filters.source
  }
  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId
  }

  const [leads, consultants] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        interestedCourse: true,
        assignedTo: true,
      },
    }),
    prisma.user.findMany({
      where: { role: { code: { in: ["CONSULTANT", "ADMIN", "SUPER_ADMIN"] } } },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ])

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    enrolled: leads.filter((l) => l.status === "ENROLLED").length,
    lost: leads.filter((l) => l.status === "LOST").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Khách hàng (Leads CRM)</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} lead · {stats.new} mới · {stats.enrolled} đã nhập học · {stats.lost} đã mất
          </p>
        </div>
        <LeadDialog />
      </div>

      <LeadFilters
        currentStatus={filters.status || ""}
        currentSource={filters.source || ""}
        currentAssignedToId={filters.assignedToId || ""}
        consultants={consultants}
      />

      <DataTable
        columns={columns as any}
        data={leads as any}
        searchKey="fullName"
        searchPlaceholder="Tìm kiếm khách hàng theo tên..."
      />
    </div>
  )
}
