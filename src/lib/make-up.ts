// Kèm bù 30 phút cho buổi học sinh nghỉ (chỉ chạy trên server).
// Điểm danh vắng → tự tạo lịch kèm bù hôm sau, cùng giờ và giáo viên của buổi. Sửa điểm danh lại thành có mặt
// → bỏ lịch kèm bù còn chờ. Buổi đã kèm bù / không bù được thì giữ nguyên (đã ảnh hưởng học phí).
import { prisma } from "@/lib/prisma"
import { vietnamDayRange } from "@/lib/curriculum"
import { MAKE_UP_MINUTES } from "@/lib/monthly-billing-shared"

const ABSENT_STATUSES = new Set(["ABSENT_WITH_PERMISSION", "ABSENT_WITHOUT_PERMISSION"])

export async function syncMakeUpLessons(sessionId: string, rows: { studentId: string; status: string }[]) {
  if (rows.length === 0) return
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, sessionDate: true, startTime: true, teacherId: true },
    })
    if (!session) return

    const studentIds = rows.map((row) => row.studentId)
    const existing = await prisma.makeUpLesson.findMany({
      where: { sessionId, studentId: { in: studentIds } },
      select: { studentId: true, status: true },
    })
    const existingIds = new Set(existing.map((item) => item.studentId))

    const absentIds = rows.filter((row) => ABSENT_STATUSES.has(row.status)).map((row) => row.studentId)
    const presentIds = rows.filter((row) => !ABSENT_STATUSES.has(row.status)).map((row) => row.studentId)
    const toCreate = absentIds.filter((studentId) => !existingIds.has(studentId))

    if (toCreate.length > 0) {
      const scheduledDate = vietnamDayRange(session.sessionDate, 1).start
      await prisma.makeUpLesson.createMany({
        data: toCreate.map((studentId) => ({
          sessionId,
          studentId,
          scheduledDate,
          startTime: session.startTime,
          durationMinutes: MAKE_UP_MINUTES,
          teacherId: session.teacherId,
        })),
      })
    }
    if (presentIds.length > 0) {
      await prisma.makeUpLesson.deleteMany({
        where: { sessionId, studentId: { in: presentIds }, status: "PENDING", creditedPaymentId: null },
      })
    }
  } catch (error) {
    // Không làm hỏng việc lưu điểm danh; danh sách kèm bù sẽ được bổ sung ở lần lưu sau
    console.error("Sync make-up lessons error:", error)
  }
}
