/**
 * Tính số giờ giữa hai chuỗi "HH:mm"
 * @returns số giờ dạng thập phân (ví dụ: 1.5 giờ)
 */
export function calculateSessionHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)

  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  // Xử lý trường hợp qua nửa đêm (hiếm gặp nhưng an toàn)
  const diffMinutes = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : 24 * 60 - startMinutes + endMinutes

  return parseFloat((diffMinutes / 60).toFixed(2))
}

/**
 * Lấy ngày đầu và cuối tháng theo múi giờ local
 */
export function getMonthRange(month: number, year: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999) // ngày cuối tháng
  return { start, end }
}

/**
 * Format số tiền VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

/**
 * Format số giờ (ví dụ: 10.5 → "10 giờ 30 phút")
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h} giờ`
  return `${h} giờ ${m} phút`
}
