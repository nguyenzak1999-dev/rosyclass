import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { PageDialog } from "./components/page-dialog"

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Trang nội dung</h1>
        <PageDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={pages} 
        searchKey="title" 
        searchPlaceholder="Tìm kiếm trang theo tiêu đề..." 
      />
    </div>
  )
}
