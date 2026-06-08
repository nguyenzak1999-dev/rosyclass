/**
 * Helper tạo slug URL-friendly từ tiếng Việt + ký tự đặc biệt.
 * Dùng cho Blog, Page, v.v.
 *
 * VD:
 *   "IELTS 5.5+ Cấp tốc!" → "ielts-55-cap-toc"
 *   "Lớp học A1 - Buổi 1"  → "lop-hoc-a1-buoi-1"
 */
export function generateSlug(input: string): string {
  if (!input) return ""

  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Xoá dấu
    .replace(/đ/g, "d") // đặc biệt cho "đ"
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xoá ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Spaces → dashes
    .replace(/-+/g, "-") // Multiple dashes → single
    .replace(/^-|-$/g, "") // Trim leading/trailing dashes
}

/**
 * Tạo slug unique bằng cách thêm suffix số nếu trùng.
 * Cần async vì check DB.
 *
 * @param base Base slug (đã được generate từ title)
 * @param checkExists Function async kiểm tra slug có tồn tại không
 * @param excludeId ID của record hiện tại (khi update, bỏ qua chính nó)
 * @param maxAttempts Số lần thử tối đa
 */
export async function generateUniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string,
  maxAttempts: number = 100
): Promise<string> {
  // Nếu base rỗng → tạo random
  if (!base) base = "post"

  let slug = base
  let counter = 1

  while (counter <= maxAttempts) {
    const exists = await checkExists(slug)
    // Nếu không tồn tại HOẶC (tồn tại nhưng là chính record hiện tại khi update) → OK
    if (!exists) return slug
    counter++
    slug = `${base}-${counter}`
  }
  return `${base}-${Date.now()}` // Fallback
}
