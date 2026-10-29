import { DAY_MS, toVietnamWallClock, vietnamMonthBounds } from "@/lib/curriculum"

/**
 * Khoảng [start, end) của tháng lương theo giờ Việt Nam.
 * Worker chạy UTC nên tính tháng theo giờ máy lệch 7 tiếng: buổi ngày 1 (lưu 17:00 UTC hôm trước) bị rơi sang tháng trước.
 */
export function payrollMonthRange(month: number, year: number) {
  const bounds = vietnamMonthBounds(`${year}-${String(month).padStart(2, "0")}`)
  if (!bounds) throw new Error("Tháng tính lương không hợp lệ")
  return { start: bounds.start, end: new Date(bounds.lastDay.getTime() + DAY_MS) }
}

/** Tháng/năm hiện tại theo giờ Việt Nam */
export function currentPayrollMonth(now = new Date()) {
  const local = toVietnamWallClock(now)
  return { month: local.getMonth() + 1, year: local.getFullYear() }
}
