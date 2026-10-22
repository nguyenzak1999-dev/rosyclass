"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { splitLines, splitWords } from "@/lib/curriculum"
import {
  curriculumSchema,
  curriculumUnitSchema,
  lessonSchema,
  moveDirectionSchema,
  type CurriculumFormValues,
  type CurriculumUnitFormValues,
  type LessonFormValues,
} from "@/lib/schemas/curriculum"

// Lưu ý D1: không dựa vào $transaction (D1 không đảm bảo tính nguyên tử),
// nên các thao tác đổi thứ tự được viết để chạy lại vẫn ra kết quả đúng.

function revalidateCurriculum(curriculumId?: string) {
  revalidatePath("/admin/curriculums")
  if (curriculumId) revalidatePath(`/admin/curriculums/${curriculumId}`)
}

export async function upsertCurriculum(data: CurriculumFormValues) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const { id, ...payload } = curriculumSchema.parse(data)

    const saved = id
      ? await prisma.curriculum.update({ where: { id }, data: payload, select: { id: true } })
      : await prisma.curriculum.create({ data: payload, select: { id: true } })

    revalidateCurriculum(saved.id)
    return { success: true, data: { id: saved.id } }
  } catch (error) {
    console.error("Curriculum upsert error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu chương trình học") }
  }
}

export async function deleteCurriculum(id: string) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    // Lớp đang dùng chương trình chỉ bị bỏ liên kết (onDelete: SetNull); Unit/Bài bị xoá theo
    await prisma.curriculum.delete({ where: { id } })
    revalidateCurriculum()
    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error) {
    console.error("Curriculum delete error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá chương trình học") }
  }
}

// ------------------------------------------------------
// UNIT
// ------------------------------------------------------

export async function upsertCurriculumUnit(data: CurriculumUnitFormValues) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const parsed = curriculumUnitSchema.parse(data)
    const payload = {
      title: parsed.title,
      objectives: parsed.objectives,
      vocabulary: JSON.stringify(splitWords(parsed.vocabularyText)),
      sentencePatterns: JSON.stringify(splitLines(parsed.sentencePatternsText)),
      phonics: parsed.phonics,
      songUrl: parsed.songUrl,
    }

    if (parsed.id) {
      const existing = await prisma.curriculumUnit.findUnique({
        where: { id: parsed.id },
        select: { curriculumId: true },
      })
      if (!existing || existing.curriculumId !== parsed.curriculumId) {
        return { success: false, error: "Không tìm thấy Unit" }
      }
      await prisma.curriculumUnit.update({ where: { id: parsed.id }, data: payload })
    } else {
      const last = await prisma.curriculumUnit.findFirst({
        where: { curriculumId: parsed.curriculumId },
        orderBy: { order: "desc" },
        select: { order: true },
      })
      await prisma.curriculumUnit.create({
        data: { ...payload, curriculumId: parsed.curriculumId, order: (last?.order ?? 0) + 1 },
      })
    }

    revalidateCurriculum(parsed.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Curriculum unit upsert error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu Unit") }
  }
}

export async function deleteCurriculumUnit(id: string) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const unit = await prisma.curriculumUnit.delete({ where: { id }, select: { curriculumId: true } })
    await renumberUnits(unit.curriculumId)
    revalidateCurriculum(unit.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Curriculum unit delete error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá Unit") }
  }
}

export async function moveCurriculumUnit(id: string, direction: "up" | "down") {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const dir = moveDirectionSchema.parse(direction)
    const unit = await prisma.curriculumUnit.findUnique({ where: { id }, select: { curriculumId: true } })
    if (!unit) return { success: false, error: "Không tìm thấy Unit" }

    const units = await prisma.curriculumUnit.findMany({
      where: { curriculumId: unit.curriculumId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true },
    })
    await applyMove(units, id, dir, (itemId, order) =>
      prisma.curriculumUnit.update({ where: { id: itemId }, data: { order } })
    )

    revalidateCurriculum(unit.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Curriculum unit move error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể đổi thứ tự Unit") }
  }
}

// ------------------------------------------------------
// LESSON
// ------------------------------------------------------

export async function upsertLesson(data: LessonFormValues) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const parsed = lessonSchema.parse(data)
    const unit = await prisma.curriculumUnit.findUnique({
      where: { id: parsed.unitId },
      select: { id: true, curriculumId: true },
    })
    if (!unit) return { success: false, error: "Không tìm thấy Unit" }

    const payload = {
      title: parsed.title,
      objectives: parsed.objectives,
      activities: parsed.activities,
      materials: parsed.materials,
      mediaUrl: parsed.mediaUrl,
      homework: parsed.homework,
    }

    if (parsed.id) {
      const existing = await prisma.lesson.findUnique({ where: { id: parsed.id }, select: { unitId: true } })
      if (!existing || existing.unitId !== unit.id) return { success: false, error: "Không tìm thấy bài học" }
      await prisma.lesson.update({ where: { id: parsed.id }, data: payload })
    } else {
      const last = await prisma.lesson.findFirst({
        where: { unitId: unit.id },
        orderBy: { order: "desc" },
        select: { order: true },
      })
      await prisma.lesson.create({ data: { ...payload, unitId: unit.id, order: (last?.order ?? 0) + 1 } })
    }

    revalidateCurriculum(unit.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Lesson upsert error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu bài học") }
  }
}

export async function deleteLesson(id: string) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    // Buổi học đã gắn bài này chỉ bị bỏ liên kết (onDelete: SetNull)
    const lesson = await prisma.lesson.delete({
      where: { id },
      select: { unitId: true, unit: { select: { curriculumId: true } } },
    })
    await renumberLessons(lesson.unitId)
    revalidateCurriculum(lesson.unit.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Lesson delete error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá bài học") }
  }
}

export async function moveLesson(id: string, direction: "up" | "down") {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const dir = moveDirectionSchema.parse(direction)
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { unitId: true, unit: { select: { curriculumId: true } } },
    })
    if (!lesson) return { success: false, error: "Không tìm thấy bài học" }

    const lessons = await prisma.lesson.findMany({
      where: { unitId: lesson.unitId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true },
    })
    await applyMove(lessons, id, dir, (itemId, order) => prisma.lesson.update({ where: { id: itemId }, data: { order } }))

    revalidateCurriculum(lesson.unit.curriculumId)
    return { success: true }
  } catch (error) {
    console.error("Lesson move error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể đổi thứ tự bài học") }
  }
}

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

/**
 * Đổi chỗ phần tử với phần tử kề bên, đồng thời đánh lại số 1..n cho cả danh sách
 * (sửa luôn các thứ tự bị trùng/lệch nếu có). Chỉ ghi những dòng thực sự đổi số.
 */
async function applyMove(
  items: Array<{ id: string; order: number }>,
  id: string,
  direction: "up" | "down",
  write: (id: string, order: number) => Promise<unknown>
) {
  const index = items.findIndex((item) => item.id === id)
  const target = direction === "up" ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= items.length) return

  const reordered = [...items]
  ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
  for (const [position, item] of reordered.entries()) {
    if (item.order !== position + 1) await write(item.id, position + 1)
  }
}

async function renumberUnits(curriculumId: string) {
  const units = await prisma.curriculumUnit.findMany({
    where: { curriculumId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  })
  for (const [position, unit] of units.entries()) {
    if (unit.order !== position + 1) {
      await prisma.curriculumUnit.update({ where: { id: unit.id }, data: { order: position + 1 } })
    }
  }
}

async function renumberLessons(unitId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { unitId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  })
  for (const [position, lesson] of lessons.entries()) {
    if (lesson.order !== position + 1) {
      await prisma.lesson.update({ where: { id: lesson.id }, data: { order: position + 1 } })
    }
  }
}
