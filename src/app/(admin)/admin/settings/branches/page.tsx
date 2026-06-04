import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { BranchDialog } from "./components/branch-dialog"

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: {
      createdAt: 'asc'
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Chi nhánh</h1>
        <BranchDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={branches} 
        searchKey="name" 
        searchPlaceholder="Tìm kiếm chi nhánh theo tên..." 
      />
    </div>
  )
}
