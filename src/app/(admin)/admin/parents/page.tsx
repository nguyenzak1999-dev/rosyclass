import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { ParentDialog } from "./components/parent-dialog"

export default async function ParentsPage() {
  const parents = await prisma.parent.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phụ huynh</h1>
        <ParentDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={parents} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm phụ huynh theo tên..." 
      />
    </div>
  )
}
