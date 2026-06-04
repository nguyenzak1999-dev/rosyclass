import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { LeadDialog } from "./components/lead-dialog"

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      interestedCourse: true,
      assignedTo: true
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Khách hàng (Leads CRM)</h1>
        <LeadDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={leads} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm khách hàng theo tên..." 
      />
    </div>
  )
}
