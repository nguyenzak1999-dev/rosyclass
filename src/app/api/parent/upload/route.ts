import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getParentSession } from "@/lib/auth/parent-session"
import { HOMEWORK_MAX_BYTES } from "@/lib/curriculum"
import { isPrismaUniqueError } from "@/lib/errors"
import { isMediaStorageConfigured, MediaStorageNotConfiguredError, storeMedia } from "@/lib/media-storage"

export const dynamic = "force-dynamic"

const NOT_CONFIGURED =
  "Chưa cấu hình kho ảnh nên tạm thời chưa gửi được ảnh hoặc ghi âm. Ba mẹ có thể gửi lời nhắn cho cô, hoặc gửi bài qua Zalo của trung tâm nhé."

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } })
}

/**
 * Phụ huynh nộp bài tập về nhà: ảnh hoặc ghi âm (≤ 15 MB) và/hoặc lời nhắn.
 * Chỉ nhận bài cho con của phụ huynh đang đăng nhập, ở lớp con đang học.
 */
export async function POST(request: NextRequest) {
  // Cookie SameSite=Lax đã chặn POST từ trang khác; kiểm tra thêm Origin cho chắc
  const origin = request.headers.get("origin")
  if (origin && new URL(origin).host !== request.nextUrl.host) return fail("Yêu cầu không hợp lệ", 403)

  const session = await getParentSession()
  if (!session) return fail("Phiên đăng nhập đã hết. Ba mẹ mở lại link trung tâm gửi nhé.", 401)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail("Dữ liệu gửi lên không hợp lệ", 400)
  }

  const homeworkId = String(form.get("homeworkId") ?? "")
  const studentId = String(form.get("studentId") ?? "")
  const note = String(form.get("note") ?? "").trim().slice(0, 500) || null
  const fileValue = form.get("file")
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null

  if (!homeworkId || !studentId) return fail("Thiếu thông tin bài tập", 400)
  if (!file && !note) return fail("Ba mẹ chọn ảnh, ghi âm hoặc viết vài dòng cho cô nhé.", 400)

  const student = await prisma.student.findFirst({ where: { id: studentId, parentId: session.parentId }, select: { id: true } })
  if (!student) return fail("Không tìm thấy bài tập", 404)

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, class: { students: { some: { studentId: student.id, status: "ACTIVE" } } } },
    select: { id: true },
  })
  if (!homework) return fail("Không tìm thấy bài tập", 404)

  const existing = await prisma.homeworkSubmission.findUnique({
    where: { homeworkId_studentId: { homeworkId: homework.id, studentId: student.id } },
    select: { id: true, status: true },
  })
  if (existing?.status === "REVIEWED") return fail("Cô đã chấm bài này rồi ạ.", 409)

  let media: { url: string; type: "image" | "audio" } | null = null
  if (file) {
    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : null
    if (!type) return fail("Chỉ nhận ảnh hoặc file ghi âm.", 400)
    if (file.size > HOMEWORK_MAX_BYTES) return fail("File lớn quá 15 MB. Ba mẹ chọn file nhỏ hơn giúp con nhé.", 400)
    if (!isMediaStorageConfigured()) return fail(NOT_CONFIGURED, 503)

    try {
      const stored = await storeMedia(file, "homework", type)
      media = { url: stored.url, type }
    } catch (error) {
      if (error instanceof MediaStorageNotConfiguredError) return fail(NOT_CONFIGURED, 503)
      console.error("[PARENT_UPLOAD_ERROR]", error)
      return fail("Chưa tải được file lên. Ba mẹ thử lại sau ít phút nhé.", 502)
    }
  }

  const values = {
    submittedBy: "PARENT",
    parentNote: note,
    status: "SUBMITTED",
    ...(media ? { mediaUrl: media.url, mediaType: media.type } : {}),
  }
  try {
    if (existing) {
      await prisma.homeworkSubmission.update({ where: { id: existing.id }, data: values })
    } else {
      await prisma.homeworkSubmission.create({ data: { ...values, homeworkId: homework.id, studentId: student.id } })
    }
  } catch (error) {
    // Bấm gửi hai lần hoặc cô vừa ghi nhận "làm trên lớp": bài đã có thì cập nhật (trừ khi cô đã chấm)
    if (!isPrismaUniqueError(error)) {
      console.error("[PARENT_SUBMIT_ERROR]", error)
      return fail("Chưa gửi được bài. Ba mẹ thử lại sau ít phút nhé.", 500)
    }
    const updated = await prisma.homeworkSubmission.updateMany({
      where: { homeworkId: homework.id, studentId: student.id, status: { not: "REVIEWED" } },
      data: values,
    })
    if (updated.count === 0) return fail("Cô đã chấm bài này rồi ạ.", 409)
  }

  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
}
