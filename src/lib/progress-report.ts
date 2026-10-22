// Dữ liệu tổng hợp của báo cáo tiến bộ (lưu ở ProgressReport.data dạng JSON).
// Dùng chung cho trang quản trị, bản in và cổng phụ huynh nên không import prisma ở đây.

export interface ProgressReportData {
  version: 1
  studentName: string
  className: string
  courseName: string | null
  teacherName: string | null
  attendance: {
    /** Số buổi của lớp trong kỳ (không tính buổi huỷ) đã diễn ra */
    sessions: number
    present: number
    late: number
    excused: number
    absent: number
    makeUp: number
    /** Số buổi đã điểm danh bé */
    recorded: number
    /** Tỉ lệ đi học (có mặt + muộn + học bù) / số buổi đã điểm danh, 0–100; null nếu chưa điểm danh buổi nào */
    rate: number | null
  }
  stars: {
    total: number
    /** Trung bình mỗi buổi được nhận xét */
    average: number | null
    feedbackCount: number
  }
  topPraises: Array<{ praise: string; count: number }>
  homework: {
    assigned: number
    submitted: number
    reviewed: number
    stickers: Array<{ sticker: string; count: number }>
  }
  skills: Array<{ skill: string; level: number; unitLabel: string; note: string | null }>
  lessons: string[]
  generatedAt: string
}

export function parseReportData(value: string | null | undefined): ProgressReportData | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as ProgressReportData
    return parsed && parsed.version === 1 ? parsed : null
  } catch {
    return null
  }
}

export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã gửi phụ huynh",
}
