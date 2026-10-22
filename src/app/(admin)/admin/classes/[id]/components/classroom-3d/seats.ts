// Dữ liệu cho phòng học 3D, tính ở server rồi truyền xuống client

export type SeatAttendance = "PRESENT" | "LATE" | "ABSENT" | "MAKE_UP" | "UNKNOWN"

export interface ClassroomSeat {
  studentId: string
  fullName: string
  code: string | null
  level: string | null
  enrollmentStatus: string
  /** Trạng thái ở buổi đã điểm danh gần nhất */
  lastAttendance: SeatAttendance
  lastSessionDate: string | null
  /** Tỉ lệ có mặt (có mặt + đi muộn + học bù) trên tổng số buổi đã điểm danh, 0..1 */
  attendanceRate: number | null
  sessionsRecorded: number
  /** Điểm trung bình quy về thang 10 */
  averageScore: number | null
  /** Số sao ở buổi có nhận xét gần nhất (null nếu bé chưa có nhận xét nào) */
  latestStars: number | null
  /** Tổng sao của bé ở lớp này */
  totalStars: number
}

export interface ClassroomData {
  className: string
  courseName: string
  teacherName: string | null
  roomName: string | null
  seats: ClassroomSeat[]
}

interface Input {
  students: Array<{
    status: string
    student: { id: string; fullName: string; code: string | null; currentLevel: string | null }
  }>
  attendances: Array<{ studentId: string; status: string; session: { sessionDate: Date } }>
  scores: Array<{ studentId: string; value: number; maxValue: number }>
  feedbacks: Array<{ studentId: string; stars: number; session: { sessionDate: Date; startTime: string } }>
}

const ATTENDED = new Set(["PRESENT", "LATE", "MAKE_UP"])

function toSeatAttendance(status: string): SeatAttendance {
  if (status === "PRESENT" || status === "LATE" || status === "MAKE_UP") return status
  if (status.startsWith("ABSENT")) return "ABSENT"
  return "UNKNOWN"
}

export function buildClassroomSeats({ students, attendances, scores, feedbacks }: Input): ClassroomSeat[] {
  const starsByStudent = new Map<string, { total: number; latest: Input["feedbacks"][number] }>()
  for (const feedback of feedbacks) {
    const current = starsByStudent.get(feedback.studentId)
    if (!current) {
      starsByStudent.set(feedback.studentId, { total: feedback.stars, latest: feedback })
      continue
    }
    current.total += feedback.stars
    const latestTime = current.latest.session.sessionDate.getTime()
    const time = feedback.session.sessionDate.getTime()
    if (time > latestTime || (time === latestTime && feedback.session.startTime > current.latest.session.startTime)) {
      current.latest = feedback
    }
  }

  const attendanceByStudent = new Map<string, Input["attendances"]>()
  for (const record of attendances) {
    const list = attendanceByStudent.get(record.studentId) ?? []
    list.push(record)
    attendanceByStudent.set(record.studentId, list)
  }

  const scoresByStudent = new Map<string, number[]>()
  for (const score of scores) {
    if (!score.maxValue) continue
    const list = scoresByStudent.get(score.studentId) ?? []
    list.push((score.value / score.maxValue) * 10)
    scoresByStudent.set(score.studentId, list)
  }

  return students
    .map(({ status, student }) => {
      const records = (attendanceByStudent.get(student.id) ?? []).sort(
        (a, b) => b.session.sessionDate.getTime() - a.session.sessionDate.getTime()
      )
      const latest = records[0]
      const studentScores = scoresByStudent.get(student.id) ?? []
      const stars = starsByStudent.get(student.id)

      return {
        studentId: student.id,
        fullName: student.fullName,
        code: student.code,
        level: student.currentLevel,
        enrollmentStatus: status,
        lastAttendance: latest ? toSeatAttendance(latest.status) : "UNKNOWN",
        lastSessionDate: latest ? latest.session.sessionDate.toISOString() : null,
        attendanceRate: records.length ? records.filter((r) => ATTENDED.has(r.status)).length / records.length : null,
        sessionsRecorded: records.length,
        averageScore: studentScores.length
          ? Math.round((studentScores.reduce((sum, value) => sum + value, 0) / studentScores.length) * 10) / 10
          : null,
        latestStars: stars ? stars.latest.stars : null,
        totalStars: stars?.total ?? 0,
      } satisfies ClassroomSeat
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"))
}

/** Xếp chỗ: tối đa 6 bàn mỗi hàng, chừa lối đi ở giữa. Trả về toạ độ (x, z) của từng bàn */
export function layoutSeats(count: number) {
  const perRow = count <= 8 ? 4 : 6
  const rows = Math.max(1, Math.ceil(count / perRow))
  const spacingX = 1.9
  const spacingZ = 2.2
  const aisle = 0.9

  const positions: Array<{ x: number; z: number; row: number; col: number }> = []
  for (let index = 0; index < Math.max(count, perRow); index++) {
    const row = Math.floor(index / perRow)
    const col = index % perRow
    const half = perRow / 2
    const offset = (col - (perRow - 1) / 2) * spacingX + (col < half ? -aisle / 2 : aisle / 2)
    positions.push({ x: offset, z: row * spacingZ, row, col })
  }

  const width = perRow * spacingX + aisle
  const depth = rows * spacingZ
  return { positions, rows, perRow, width, depth }
}
