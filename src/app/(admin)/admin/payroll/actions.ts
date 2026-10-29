"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { calculateSessionHours } from "@/lib/payroll-utils"
import { payrollMonthRange } from "./payroll-month"

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
  await requirePermission(PERMISSIONS.paymentsWrite)
  try {
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
      return { success: false, error: "Tháng tính lương không hợp lệ" }
    }
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    })
    if (!teacher) return { success: false, error: "Không tìm thấy giáo viên" }

    const { start, end } = payrollMonthRange(month, year)

    // Lấy tất cả buổi học COMPLETED của giáo viên trong tháng
    const sessions = await prisma.classSession.findMany({
      where: {
        teacherId,
        status: "COMPLETED",
        sessionDate: { gte: start, lt: end },
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

    // Upsert phiếu lương
    const existing = await prisma.teacherPayroll.findUnique({
      where: { teacherId_month_year: { teacherId, month, year } },
    })

    const finalBonus = overrides?.bonusAmount !== undefined ? bonusAmount : (existing?.bonusAmount ?? 0)
    const finalDeduct = overrides?.deductAmount !== undefined ? deductAmount : (existing?.deductAmount ?? 0)
    const totalAmount = parseFloat((baseAmount + finalBonus - finalDeduct).toFixed(0))

    let historyLogs: any[] = Array.isArray(existing?.historyLogs) ? (existing.historyLogs as any[]) : []
    if (existing && existing.status === "PAID") {
      historyLogs.push({
        date: new Date().toISOString(),
        action: "Tính lại lương sau thanh toán",
        details: `Cập nhật lại lương dựa trên giờ dạy mới. Tiền cũ: ${existing.totalAmount} đ`
      })
    }

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
        bonusReason: overrides?.bonusReason || null,
        deductAmount: finalDeduct,
        deductReason: overrides?.deductReason || null,
        notes: overrides?.notes || null,
        totalAmount,
        status: "DRAFT",
      },
      update: {
        totalHours,
        hourlyRate,
        baseAmount,
        bonusAmount: finalBonus,
        // undefined = không gửi (tính hàng loạt) → giữ cũ; chuỗi rỗng = người dùng xoá → null
        bonusReason: overrides?.bonusReason !== undefined ? overrides.bonusReason || null : existing?.bonusReason,
        deductAmount: finalDeduct,
        deductReason: overrides?.deductReason !== undefined ? overrides.deductReason || null : existing?.deductReason,
        notes: overrides?.notes !== undefined ? overrides.notes || null : existing?.notes,
        totalAmount,
        historyLogs,
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
  await requirePermission(PERMISSIONS.paymentsWrite)
  try {
    const [teachers, paidPayrolls] = await Promise.all([
      prisma.teacher.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      }),
      prisma.teacherPayroll.findMany({
        where: { month, year, status: "PAID" },
        select: { teacherId: true },
      }),
    ])

    // Phiếu đã trả lương là số đã chốt: tính hàng loạt không được âm thầm đổi số tiền (muốn tính lại thì làm từng phiếu)
    const paidTeacherIds = new Set(paidPayrolls.map((p) => p.teacherId))
    const pending = teachers.filter((t) => !paidTeacherIds.has(t.id))

    // Tuần tự: chạy song song nhiều truy vấn D1 cùng lúc dễ lỗi khi có nhiều giáo viên
    let successCount = 0
    for (const t of pending) {
      const res = await calculateTeacherPayroll(t.id, month, year).catch(() => null)
      if (res?.success) successCount += 1
    }

    revalidatePath("/admin/payroll")
    return { success: true, total: pending.length, updated: successCount, skippedPaid: paidTeacherIds.size }
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
    hourlyRate?: number
    bonusAmount: number
    bonusReason?: string
    deductAmount: number
    deductReason?: string
    notes?: string
  }
) {
  await requirePermission(PERMISSIONS.paymentsWrite)
  try {
    const payroll = await prisma.teacherPayroll.findUnique({ where: { id: payrollId } })
    if (!payroll) return { success: false, error: "Không tìm thấy phiếu lương" }

    // Đổi đơn giá/giờ trong form phải được lưu (trước đây bị bỏ qua, xem trước khác số đã lưu)
    const hourlyRate = data.hourlyRate ?? payroll.hourlyRate
    const baseAmount = parseFloat((payroll.totalHours * hourlyRate).toFixed(0))
    const totalAmount = parseFloat(
      (baseAmount + data.bonusAmount - data.deductAmount).toFixed(0)
    )

    let historyLogs: any[] = Array.isArray(payroll.historyLogs) ? (payroll.historyLogs as any[]) : []
    if (payroll.status === "PAID") {
      historyLogs.push({
        date: new Date().toISOString(),
        action: "Điều chỉnh thủ công sau thanh toán",
        details: `Cập nhật Thưởng (${data.bonusAmount}) / Khấu trừ (${data.deductAmount}). Tiền cũ: ${payroll.totalAmount} đ`
      })
    }

    const updated = await prisma.teacherPayroll.update({
      where: { id: payrollId },
      data: {
        hourlyRate,
        baseAmount,
        bonusAmount: data.bonusAmount,
        bonusReason: data.bonusReason || null,
        deductAmount: data.deductAmount,
        deductReason: data.deductReason || null,
        notes: data.notes || null,
        totalAmount,
        historyLogs,
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
  await requirePermission(PERMISSIONS.paymentsWrite)
  try {
    const payroll = await prisma.teacherPayroll.findUnique({ where: { id: payrollId }, select: { status: true } })
    if (!payroll) return { success: false, error: "Không tìm thấy phiếu lương" }
    if (payroll.status === "PAID") return { success: false, error: "Phiếu lương này đã được thanh toán" }

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
// Cập nhật thông tin tài khoản ngân hàng của giáo viên
// ============================================================
export async function updateTeacherBank(
  teacherId: string, 
  data: { bankName: string; bankAccountNo: string; bankAccountName: string }
) {
  await requirePermission(PERMISSIONS.paymentsWrite)
  try {
    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        bankName: data.bankName.trim() || null,
        bankAccountNo: data.bankAccountNo.trim() || null,
        bankAccountName: data.bankAccountName.trim() || null,
      },
    })
    revalidatePath("/admin/payroll")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[updateTeacherBank]", error)
    return { success: false, error: "Lỗi khi cập nhật tài khoản giáo viên" }
  }
}

// ============================================================
// Lấy danh sách phiếu lương theo tháng/năm
// ============================================================
export async function getPayrollsByMonth(month: number, year: number) {
  await requirePermission(PERMISSIONS.paymentsRead)
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
  await requirePermission(PERMISSIONS.paymentsRead)
  const payroll = await prisma.teacherPayroll.findUnique({
    where: { id: payrollId },
    include: {
      teacher: { select: { id: true, fullName: true, avatar: true, phone: true, email: true } },
    },
  })

  if (!payroll) return null

  const { start, end } = payrollMonthRange(payroll.month, payroll.year)
  const sessions = await prisma.classSession.findMany({
    where: {
      teacherId: payroll.teacherId,
      status: "COMPLETED",
      sessionDate: { gte: start, lt: end },
    },
    include: {
      class: { select: { name: true } },
    },
    orderBy: { sessionDate: "asc" },
  })

  return { payroll, sessions }
}
