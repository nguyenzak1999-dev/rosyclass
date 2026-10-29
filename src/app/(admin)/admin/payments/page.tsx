import { prisma } from "@/lib/prisma"
import { PaymentsClient } from "./components/payments-client"
import { PaymentFilters } from "./components/payment-filters"
import { Prisma } from "@/generated/prisma/client"
import { getSiteSettings } from "@/lib/get-site-settings"
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/schemas/payment"

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
  // Giá trị lạ trên URL (vd. ?status=abc) làm Prisma ném lỗi enum và sập trang: bỏ qua
  if (filters.status && (PAYMENT_STATUSES as readonly string[]).includes(filters.status)) {
    where.status = filters.status as Prisma.EnumPaymentStatusFilter
  }
  if (filters.method && (PAYMENT_METHODS as readonly string[]).includes(filters.method)) {
    where.paymentMethod = filters.method as Prisma.EnumPaymentMethodFilter
  }
  if (filters.studentId) {
    where.studentId = filters.studentId
  }

  const [payments, students, siteSettings, billingClasses] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: { 
          select: { 
            id: true, 
            fullName: true, 
            phone: true, 
            email: true,
            code: true,
            parent: {
              select: {
                fullName: true,
                phone: true,
                email: true
              }
            }
          } 
        },
        class: { select: { id: true, name: true } },
        course: { select: { name: true } },
        createdBy: { select: { fullName: true } },
        lineItems: {
          orderBy: { createdAt: "asc" }
        }
      },
    }),
    prisma.student.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    getSiteSettings(),
    prisma.class.findMany({
      where: { status: { in: ["ACTIVE", "UPCOMING"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  // Stats: phiếu đã huỷ / đã hoàn tiền không còn là tiền phải thu hay đã thu
  const billable = payments.filter((p) => p.status !== "CANCELLED" && p.status !== "REFUNDED")
  const stats = {
    total: payments.length,
    totalAmount: billable.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: billable.reduce((sum, p) => sum + p.paidAmount, 0),
    remainingAmount: billable.reduce((sum, p) => sum + p.remainingAmount, 0),
    unpaidCount: payments.filter((p) => p.status === "UNPAID").length,
    partialCount: payments.filter((p) => p.status === "PARTIAL").length,
    paidCount: payments.filter((p) => p.status === "PAID").length,
  }

  const validPayments = payments.map((p) => ({
    id: p.id,
    receiptCode: p.receiptCode,
    studentId: p.studentId,
    totalAmount: p.totalAmount,
    paidAmount: p.paidAmount,
    remainingAmount: p.remainingAmount,
    paymentMethod: p.paymentMethod,
    status: p.status,
    paymentDate: p.paymentDate,
    dueDate: p.dueDate,
    qrPayload: p.qrPayload,
    bankName: p.bankName,
    bankAccountName: p.bankAccountName,
    bankAccountNo: p.bankAccountNo,
    note: p.note,
    billingMonth: p.billingMonth,
    billingSummary: p.billingSummary,
    createdAt: p.createdAt,
    student: {
      id: p.student?.id,
      fullName: p.student?.fullName || "—",
      phone: p.student?.phone,
      email: p.student?.email,
      code: p.student?.code || null,
      parent: p.student?.parent || null,
    },
    class: p.class,
    course: p.course,
    createdBy: p.createdBy,
    lineItems: p.lineItems || [],
  }))

  return (
    <PaymentsClient
      payments={validPayments as any}
      students={students}
      billingClasses={billingClasses}
      stats={stats}
      siteSettings={siteSettings}
      filterSlot={
        <PaymentFilters
          key="payment-filters"
          currentStatus={filters.status || ""}
          currentMethod={filters.method || ""}
          currentStudentId={filters.studentId || ""}
          students={students}
        />
      }
    />
  )
}
