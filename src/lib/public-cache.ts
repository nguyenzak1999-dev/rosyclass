import { revalidatePath } from "next/cache"

/**
 * Trang công khai được cache (ISR trên Workers KV) tới 1 ngày để Worker ít tốn CPU.
 * Gọi hàm này sau mỗi thao tác admin làm đổi nội dung hiển thị ngoài website (cài đặt, CMS, khoá học,
 * lớp học và sĩ số, giáo viên…): mọi trang cache đều mang nhãn của layout gốc nên bị làm mới hết một lần,
 * lượt xem kế tiếp sẽ dựng lại trang với dữ liệu mới.
 */
export function revalidatePublicSite() {
  revalidatePath("/", "layout")
}
