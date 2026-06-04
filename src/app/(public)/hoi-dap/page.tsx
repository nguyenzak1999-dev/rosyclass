import { prisma } from "@/lib/prisma"
import FAQClient from "./faq-client"

// Default FAQs khi chưa có dữ liệu trong DB
const DEFAULT_FAQS = [
  {
    q: "RosyClass sử dụng giáo trình gì?",
    a: "Chúng tôi sử dụng giáo trình chuẩn quốc tế mới nhất từ Cambridge và Oxford, được biên soạn lại để phù hợp với người học Việt Nam."
  },
  {
    q: "Lớp học có bao nhiêu học viên?",
    a: "Để đảm bảo tương tác 1-1 và hiệu quả cao nhất, mỗi lớp chỉ giới hạn tối đa 12 học viên."
  },
  {
    q: "Trung tâm có cam kết đầu ra không?",
    a: "Có. Tất cả các khóa luyện thi IELTS và tiếng Anh thiếu niên đều có hợp đồng cam kết đầu ra rõ ràng."
  },
  {
    q: "Học phí có thể đóng theo từng tháng không?",
    a: "Có, RosyClass hỗ trợ nhiều hình thức thanh toán linh hoạt, bao gồm trả góp 0% qua thẻ tín dụng."
  },
  {
    q: "Nếu nghỉ học có được học bù không?",
    a: "Học viên được quyền học bù tại các lớp cùng trình độ trong tuần, hoặc nhận tài liệu/video record buổi học (với lớp online)."
  }
]

export default async function FAQPage() {
  // FAQ được lưu trong Page model với slug "hoi-dap"
  // Nội dung là JSON array [{q: "...", a: "..."}]
  const page = await prisma.page.findUnique({
    where: { slug: "hoi-dap", status: "ACTIVE" }
  })

  let faqs = DEFAULT_FAQS
  if (page?.content) {
    try {
      const parsed = JSON.parse(page.content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqs = parsed
      }
    } catch {
      // Nếu không parse được, dùng default
    }
  }

  return <FAQClient faqs={faqs} />
}
