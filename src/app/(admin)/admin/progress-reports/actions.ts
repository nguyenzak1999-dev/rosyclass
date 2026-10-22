"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { DAY_MS, formatVietnamDate, formatVietnamDayMonth, parseVietnamDateKey, vietnamMonthBounds } from "@/lib/curriculum"
import { buildProgressReportData } from "@/lib/progress-report-builder"
import {
  generateReportsSchema,
  reportCommentSchema,
  saveSkillAssessmentsSchema,
  type GenerateReportsValues,
  type SaveSkillAssessmentsValues,
} from "@/lib/schemas/homework"

// ------------------------------------------------------
// Đánh giá kỹ năng cuối Unit
// ------------------------------------------------------

/** Lưu cả lưới bé × kỹ năng của một Unit: upsert theo (bé, Unit, kỹ năng); level null = xoá */
export async function saveSkillAssessments(data: SaveSkillAssessmentsValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = saveSkillAssessmentsSchema.parse(data)

    const classData = await prisma.class.findUnique({ where: { id: parsed.classId }, select: { curriculumId: true } })
    if (!classData) return { success: false, error: "Không tìm thấy lớp học" }
    const unit = await prisma.curriculumUnit.findUnique({ where: { id: parsed.unitId }, select: { curriculumId: true } })
    if (!unit || unit.curriculumId !== classData.curriculumId) {
      return { success: false, error: "Unit không thuộc chương trình của lớp" }
    }

    const members = await prisma.classStudent.findMany({ where: { classId: parsed.classId }, select: { studentId: true } })
    const memberIds = new Set(members.map((row) => row.studentId))

    let saved = 0
    let removed = 0
    for (const entry of parsed.entries) {
      if (!memberIds.has(entry.studentId)) continue
      const key = { studentId_unitId_skill: { studentId: entry.studentId, unitId: parsed.unitId, skill: entry.skill } }
      if (entry.level === null) {
        const result = await prisma.skillAssessment.deleteMany({
          where: { studentId: entry.studentId, unitId: parsed.unitId, skill: entry.skill },
        })
        removed += result.count
        continue
      }
      await prisma.skillAssessment.upsert({
        where: key,
        create: {
          studentId: entry.studentId,
          unitId: parsed.unitId,
          skill: entry.skill,
          classId: parsed.classId,
          level: entry.level,
          note: entry.note,
          assessedById: user.id,
        },
        update: { level: entry.level, note: entry.note, classId: parsed.classId, assessedById: user.id },
      })
      saved++
    }

    revalidatePath(`/admin/classes/${parsed.classId}`)
    return { success: true, data: { saved, removed } }
  } catch (error) {
    console.error("Save skill assessments error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu đánh giá kỹ năng") }
  }
}

// ------------------------------------------------------
// Báo cáo tiến bộ
// ------------------------------------------------------

/**
 * Tạo (hoặc làm mới) bản nháp báo cáo cho mọi bé đang học trong lớp.
 * Báo cáo cùng kỳ đã có: cập nhật số liệu, giữ nguyên nhận xét của giáo viên.
 * Báo cáo đã gửi phụ huynh thì giữ nguyên (phụ huynh đã xem bản đó).
 */
export async function generateProgressReports(data: GenerateReportsValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = generateReportsSchema.parse(data)

    const periodStart = parseVietnamDateKey(parsed.from)
    const periodEnd = parseVietnamDateKey(parsed.to)
    if (!periodStart || !periodEnd) return { success: false, error: "Kỳ báo cáo không hợp lệ" }
    if (periodEnd.getTime() - periodStart.getTime() > 366 * DAY_MS) {
      return { success: false, error: "Kỳ báo cáo tối đa 1 năm" }
    }

    const classData = await prisma.class.findUnique({ where: { id: parsed.classId }, select: { id: true } })
    if (!classData) return { success: false, error: "Không tìm thấy lớp học" }

    const members = await prisma.classStudent.findMany({
      where: { classId: parsed.classId, status: "ACTIVE" },
      select: { studentId: true },
    })
    if (members.length === 0) return { success: false, error: "Lớp chưa có học viên đang học" }
    const studentIds = members.map((row) => row.studentId)

    // Trọn một tháng → "Báo cáo tiến bộ tháng 10/2026", còn lại ghi khoảng ngày
    const isWholeMonth = parsed.from.endsWith("-01") && vietnamMonthBounds(parsed.from.slice(0, 7))?.lastDay.getTime() === periodEnd.getTime()
    const title =
      parsed.title ||
      (isWholeMonth
        ? `Báo cáo tiến bộ tháng ${formatVietnamDate(periodStart).slice(3)}`
        : `Báo cáo tiến bộ ${formatVietnamDayMonth(periodStart)} – ${formatVietnamDate(periodEnd)}`)

    const [dataByStudent, existing] = await Promise.all([
      buildProgressReportData(parsed.classId, studentIds, periodStart, new Date(periodEnd.getTime() + DAY_MS)),
      prisma.progressReport.findMany({
        where: { classId: parsed.classId, periodStart, periodEnd },
        select: { id: true, studentId: true, status: true },
      }),
    ])
    const existingByStudent = new Map(existing.map((row) => [row.studentId, row]))

    let created = 0
    let updated = 0
    let keptPublished = 0
    for (const studentId of studentIds) {
      const json = JSON.stringify(dataByStudent.get(studentId))
      const report = existingByStudent.get(studentId)
      if (!report) {
        await prisma.progressReport.create({
          data: { studentId, classId: parsed.classId, title, periodStart, periodEnd, data: json, createdById: user.id },
        })
        created++
      } else if (report.status === "PUBLISHED") {
        keptPublished++
      } else {
        await prisma.progressReport.update({ where: { id: report.id }, data: { data: json, title } })
        updated++
      }
    }

    revalidatePath(`/admin/classes/${parsed.classId}`)
    return { success: true, data: { created, updated, keptPublished } }
  } catch (error) {
    console.error("Generate progress reports error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể tạo báo cáo") }
  }
}

/** Tính lại số liệu cho một báo cáo nháp (giữ nhận xét) */
export async function refreshProgressReport(reportId: string) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const report = await prisma.progressReport.findUnique({
      where: { id: reportId },
      select: { id: true, classId: true, studentId: true, status: true, periodStart: true, periodEnd: true },
    })
    if (!report) return { success: false, error: "Không tìm thấy báo cáo" }
    if (report.status === "PUBLISHED") return { success: false, error: "Báo cáo đã gửi, hãy thu hồi trước khi tính lại" }

    const dataByStudent = await buildProgressReportData(
      report.classId,
      [report.studentId],
      report.periodStart,
      new Date(report.periodEnd.getTime() + DAY_MS)
    )
    await prisma.progressReport.update({
      where: { id: report.id },
      data: { data: JSON.stringify(dataByStudent.get(report.studentId)) },
    })
    revalidatePath(`/admin/classes/${report.classId}`)
    revalidatePath(`/admin/progress-reports/${report.id}`)
    return { success: true }
  } catch (error) {
    console.error("Refresh progress report error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể tính lại báo cáo") }
  }
}

export async function saveReportComment(reportId: string, teacherComment: string | null) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = reportCommentSchema.parse({ reportId, teacherComment })
    const report = await prisma.progressReport.update({
      where: { id: parsed.reportId },
      data: { teacherComment: parsed.teacherComment },
      select: { classId: true },
    })
    revalidatePath(`/admin/classes/${report.classId}`)
    revalidatePath(`/admin/progress-reports/${parsed.reportId}`)
    return { success: true }
  } catch (error) {
    console.error("Save report comment error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu nhận xét") }
  }
}

/** Gửi (publish) hoặc thu hồi về bản nháp; nhiều báo cáo một lúc */
export async function setReportsPublished(reportIds: string[], published: boolean) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const ids = Array.from(new Set(reportIds)).slice(0, 200)
    if (ids.length === 0) return { success: false, error: "Chưa chọn báo cáo" }

    const classIds = new Set<string>()
    let changed = 0
    for (const id of ids) {
      const report = await prisma.progressReport.findUnique({ where: { id }, select: { id: true, classId: true, status: true } })
      if (!report) continue
      classIds.add(report.classId)
      if ((report.status === "PUBLISHED") === published) continue
      await prisma.progressReport.update({
        where: { id },
        data: published ? { status: "PUBLISHED", publishedAt: new Date() } : { status: "DRAFT", publishedAt: null },
      })
      changed++
    }

    for (const classId of classIds) revalidatePath(`/admin/classes/${classId}`)
    for (const id of ids) revalidatePath(`/admin/progress-reports/${id}`)
    return { success: true, data: { changed } }
  } catch (error) {
    console.error("Publish progress reports error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể cập nhật báo cáo") }
  }
}

export async function deleteProgressReport(reportId: string) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const report = await prisma.progressReport.findUnique({ where: { id: reportId }, select: { classId: true } })
    if (!report) return { success: false, error: "Không tìm thấy báo cáo" }
    await prisma.progressReport.delete({ where: { id: reportId } })
    revalidatePath(`/admin/classes/${report.classId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete progress report error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá báo cáo") }
  }
}
