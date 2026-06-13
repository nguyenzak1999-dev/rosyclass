"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculateSessionHours, getMonthRange } from "@/lib/payroll-utils"

// ============================================================
// Tính lương cho 1 giáo viên trong 1 tháng
// Nếu phiếu lương đã tồn tại ở trạng thái DRAFT → cập nhật
// Nếu chưa có → tạo mới
// ============================================================
export async function calculateTeacherPayroll(
  teacherId: string,
  month: number,
  year: number,
  overrides?: {
    hourlyRate?: number
    bonusAmount?: number
    bonusReason?: string
    deductAmount?: number
    deductReason?: string
    notes?: string
  }
) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    })
    if (!teacher) return { success: false, error: "Không tìm thấy giáo viên" }

    const { start, end } = getMonthRange(month, year)

    // Lấy tất cả buổi học COMPLETED của giáo viên trong tháng
    const sessions = await prisma.classSession.findMany({
      where: {
        teacherId,
        status: "COMPLETED",
        sessionDate: { gte: start, lte: end },
      },
      select: { startTime: true, endTime: true },
    })

    // Tính tổng số giờ
    const totalHours = sessions.reduce((sum, s) => {
      return sum + calculateSessionHours(s.startTime, s.endTime)
    }, 0)

    // Ưu tiên hourlyRate từ override, nếu không thì lấy từ hồ sơ GV
    const hourlyRate = overrides?.hourlyRate ?? teacher.hourlyRate
    const baseAmount = parseFloat((totalHours * hourlyRate).toFixed(0))

    const bonusAmount = overrides?.bonusAmount ?? 0
    const deductAmount = overrides?.deductAmount ?? 0

    // Upsert phiếu lương (chỉ tạo/cập nhật nếu là DRAFT)
    const existing = await prisma.teacherPayroll.findUnique({
      where: { teacherId_month_year: { teacherId, month, year } },
    })

    if (existing && existing.status === "PAID") {
      return { success: false, error: "Phiếu lương tháng này đã được thanh toán, không thể tính lại." }
    }

    // Nếu đã có phiếu nháp: giữ nguyên bonus/deduct cũ trừ khi override chỉ định
    const finalBonus = overrides?.bonusAmount !== undefined ? bonusAmount : (existing?.bonusAmount ?? 0)
    const finalDeduct = overrides?.deductAmount !== undefined ? deductAmount : (existing?.deductAmount ?? 0)
    const totalAmount = parseFloat((baseAmount + finalBonus - finalDeduct).toFixed(0))

    const payroll = await prisma.teacherPayroll.upsert({
      where: { teacherId_month_year: { teacherId, month, year } },
      create: {
        teacherId,
        month,
        year,
        totalHours,
        hourlyRate,
        baseAmount,
        bonusAmount: finalBonus,
        bonusReason: overrides?.bonusReason,
        deductAmount: finalDeduct,
        deductReason: overrides?.deductReason,
        notes: overrides?.notes,
        totalAmount,
        status: "DRAFT",
      },
      update: {
        totalHours,
        hourlyRate,
        baseAmount,
        bonusAmount: finalBonus,
        bonusReason: overrides?.bonusReason ?? existing?.bonusReason,
        deductAmount: finalDeduct,
        deductReason: overrides?.deductReason ?? existing?.deductReason,
        notes: overrides?.notes ?? existing?.notes,
        totalAmount,
      },
    })

    revalidatePath("/admin/payroll")
    return { success: true, data: payroll }
  } catch (error) {
    console.error("[calculateTeacherPayroll]", error)
    return { success: false, error: "Lỗi khi tính lương" }
  }
}


// ============================================================
// Tính lương hàng loạt cho tất cả giáo viên trong 1 tháng
// ============================================================
export async function calculateAllPayrolls(month: number, year: number) {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    })

    const results = await Promise.allSettled(
      teachers.map((t) => calculateTeacherPayroll(t.id, month, year))
    )

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length

    revalidatePath("/admin/payroll")
    return { success: true, total: teachers.length, updated: successCount }
  } catch (error) {
    console.error("[calculateAllPayrolls]", error)
    return { success: false, error: "Lỗi khi tính lương hàng loạt" }
  }
}

// ============================================================
// Cập nhật thưởng / khấu trừ thủ công
// ============================================================
export async function updatePayrollExtras(
  payrollId: string,
  data: {
    bonusAmount: number
    bonusReason?: string
    deductAmount: number
    deductReason?: string
    notes?: string
  }
) {
  try {
    const payroll = await prisma.teacherPayroll.findUnique({ where: { id: payrollId } })
    if (!payroll) return { success: false, error: "Không tìm thấy phiếu lương" }
    if (payroll.status === "PAID")
      return { success: false, error: "Phiếu lương đã thanh toán, không thể chỉnh sửa" }

    const totalAmount = parseFloat(
      (payroll.baseAmount + data.bonusAmount - data.deductAmount).toFixed(0)
    )

    const updated = await prisma.teacherPayroll.update({
      where: { id: payrollId },
      data: {
        bonusAmount: data.bonusAmount,
        bonusReason: data.bonusReason,
        deductAmount: data.deductAmount,
        deductReason: data.deductReason,
        notes: data.notes,
        totalAmount,
      },
    })

    revalidatePath("/admin/payroll")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[updatePayrollExtras]", error)
    return { success: false, error: "Lỗi khi cập nhật phiếu lương" }
  }
}

// ============================================================
// Xác nhận đã thanh toán
// ============================================================
export async function markPayrollAsPaid(payrollId: string) {
  try {
    const updated = await prisma.teacherPayroll.update({
      where: { id: payrollId },
      data: { status: "PAID", paidAt: new Date() },
    })

    revalidatePath("/admin/payroll")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[markPayrollAsPaid]", error)
    return { success: false, error: "Lỗi khi xác nhận thanh toán" }
  }
}

// ============================================================
// Lấy danh sách phiếu lương theo tháng/năm
// ============================================================
export async function getPayrollsByMonth(month: number, year: number) {
  return prisma.teacherPayroll.findMany({
    where: { month, year },
    include: {
      teacher: { select: { id: true, fullName: true, hourlyRate: true, avatar: true } },
    },
    orderBy: { teacher: { fullName: "asc" } },
  })
}

// ============================================================
// Lấy chi tiết phiếu lương + danh sách buổi học
// ============================================================
export async function getPayrollDetail(payrollId: string) {
  const payroll = await prisma.teacherPayroll.findUnique({
    where: { id: payrollId },
    include: {
      teacher: { select: { id: true, fullName: true, avatar: true, phone: true, email: true } },
    },
  })

  if (!payroll) return null

  const { start, end } = getMonthRange(payroll.month, payroll.year)
  const sessions = await prisma.classSession.findMany({
    where: {
      teacherId: payroll.teacherId,
      status: "COMPLETED",
      sessionDate: { gte: start, lte: end },
    },
    include: {
      class: { select: { name: true } },
    },
    orderBy: { sessionDate: "asc" },
  })

  return { payroll, sessions }
}
