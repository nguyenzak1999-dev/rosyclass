import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/auth/permissions"
import { PayrollClient } from "./components/payroll-client"
import { currentPayrollMonth, payrollMonthRange } from "./payroll-month"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function PayrollPage({ searchParams }: PageProps) {
  await requireAdminUser()
  const filters = await searchParams

  // Mặc định tháng hiện tại theo giờ VN; tham số sai (vd. ?month=abc) quay về mặc định thay vì NaN
  const current = currentPayrollMonth()
  const parsedMonth = Number.parseInt(filters.month ?? "", 10)
  const parsedYear = Number.parseInt(filters.year ?? "", 10)
  const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : current.month
  const year = parsedYear >= 2000 && parsedYear <= 2100 ? parsedYear : current.year

  const { start, end } = payrollMonthRange(month, year)

  // Query 1: Lấy tất cả giáo viên active + sessions trong tháng
  const teachers = await prisma.teacher.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" },
    include: {
      sessions: {
        where: {
          status: "COMPLETED",
          sessionDate: { gte: start, lt: end },
        },
        select: { startTime: true, endTime: true },
      },
    },
  })

  // Query 2: Lấy phiếu lương tháng này (tách riêng để tránh lỗi nếu migration chưa chạy)
  let payrolls: any[] = []
  let totalFund = 0
  let paidCount = 0
  try {
    payrolls = await (prisma as any).teacherPayroll.findMany({
      where: { month, year },
    })
    totalFund = payrolls.reduce((sum: number, p: any) => sum + p.totalAmount, 0)
    paidCount = payrolls.filter((p: any) => p.status === "PAID").length
  } catch {
    // TeacherPayroll chưa được migrate — bỏ qua, page vẫn render
  }

  // Gắn payroll vào từng teacher
  const teachersWithPayroll = teachers.map((t) => ({
    ...t,
    payrolls: payrolls.filter((p: any) => p.teacherId === t.id),
  }))

  return (
    <PayrollClient
      teachers={teachersWithPayroll as any}
      month={month}
      year={year}
      totalFund={totalFund}
      paidCount={paidCount}
      totalTeachers={teachers.length}
    />
  )
}

