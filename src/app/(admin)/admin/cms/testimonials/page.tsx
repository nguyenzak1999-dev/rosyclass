import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { columns } from "./components/columns"
import { TestimonialDialog } from "./components/testimonial-dialog"
import { TestimonialFilters } from "./components/testimonial-filters"
import { Prisma } from "@prisma/client"
import { Star } from "lucide-react"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    isPublished?: string
  }>
}

export default async function TestimonialsPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.TestimonialWhereInput = {}
  if (filters.isPublished === "true") {
    where.isPublished = true
  } else if (filters.isPublished === "false") {
    where.isPublished = false
  }

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: testimonials.length,
    published: testimonials.filter((t) => t.isPublished).length,
    avgRating:
      testimonials.length > 0
        ? Math.round(
            (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) * 10
          ) / 10
        : 0,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cảm nhận học viên</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Tổng {stats.total} cảm nhận · {stats.published} đang hiện
            {stats.avgRating > 0 && (
              <span className="flex items-center gap-1">
                · TB <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline" /> {stats.avgRating}/5
              </span>
            )}
          </p>
        </div>
        <TestimonialDialog />
      </div>

      <TestimonialFilters currentIsPublished={filters.isPublished || ""} />

      <DataTable
        columns={columns}
        data={testimonials}
        searchKey="authorName"
        searchPlaceholder="Tìm theo tên học viên..."
      />
    </div>
  )
}
