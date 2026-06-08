import { prisma } from "@/lib/prisma"
import { PaymentsClient } from "./components/payments-client"
import { PaymentFilters } from "./components/payment-filters"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    status?: string
    method?: string
    studentId?: string
  }>
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const filters = await searchParams

  const where: Prisma.PaymentWhereInput = {}
  if (filters.status) {
    where.status = filters.status as Prisma.EnumPaymentStatusFilter
  }
  if (filters.method) {
    where.paymentMethod = filters.method as Prisma.EnumPaymentMethodFilter
  }
  if (filters.studentId) {
    where.studentId = filters.studentId
  }

  const [payments, students] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
        class: { select: { id: true, name: true } },
        course: { select: { name: true } },
      },
    }),
    prisma.student.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ])

  // Stats
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: payments.reduce((sum, p) => sum + p.paidAmount, 0),
    remainingAmount: payments.reduce((sum, p) => sum + p.remainingAmount, 0),
    unpaidCount: payments.filter((p) => p.status === "UNPAID").length,
    partialCount: payments.filter((p) => p.status === "PARTIAL").length,
    paidCount: payments.filter((p) => p.status === "PAID").length,
  }

  const validPayments = payments.map((p) => ({
    id: p.id,
    studentId: p.studentId,
    totalAmount: p.totalAmount,
    paidAmount: p.paidAmount,
    remainingAmount: p.remainingAmount,
    paymentMethod: p.paymentMethod,
    status: p.status,
    paymentDate: p.paymentDate,
    dueDate: p.dueDate,
    note: p.note,
    createdAt: p.createdAt,
    student: {
      id: p.student?.id,
      fullName: p.student?.fullName || "—",
      phone: p.student?.phone,
    },
    class: p.class,
    course: p.course,
  }))

  return (
    <PaymentsClient
      payments={validPayments as any}
      students={students}
      stats={stats}
      filterSlot={
        <PaymentFilters
          currentStatus={filters.status || ""}
          currentMethod={filters.method || ""}
          currentStudentId={filters.studentId || ""}
          students={students}
        />
      }
    />
  )
}
