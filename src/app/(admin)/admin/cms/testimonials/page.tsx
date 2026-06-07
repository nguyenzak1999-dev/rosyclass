import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { columns } from "./components/columns"
import { TestimonialDialog } from "./components/testimonial-dialog"

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cảm nhận học viên</h1>
        <TestimonialDialog />
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        searchKey="authorName"
        searchPlaceholder="Tìm theo tên học viên..."
      />
    </div>
  )
}
