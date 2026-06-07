import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { FaqDialog } from "./components/faq-dialog"
import { columns } from "./components/columns"

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [
      { position: "asc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý FAQ</h1>
        <FaqDialog />
      </div>

      <DataTable columns={columns} data={faqs} searchKey="question" searchPlaceholder="Tìm FAQ..." />
    </div>
  )
}
