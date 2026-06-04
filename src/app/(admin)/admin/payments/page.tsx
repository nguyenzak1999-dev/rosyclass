import { prisma } from "@/lib/prisma"
import { PaymentsClient } from "./components/payments-client"

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { student: true }
  })

  const students = await prisma.student.findMany({
    select: { id: true, fullName: true }
  })

  const validPayments = payments.map((p) => ({
    id: p.id,
    studentId: p.studentId,
    totalAmount: p.totalAmount,
    paidAmount: p.paidAmount,
    remainingAmount: p.remainingAmount,
    paymentMethod: p.paymentMethod,
    status: p.status,
    note: p.note,
    createdAt: p.createdAt,
    student: { fullName: p.student?.fullName || "—" }
  }))

  return <PaymentsClient payments={validPayments} students={students} />
}
