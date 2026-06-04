import Link from "next/link"
import { BookOpenCheck, ClipboardCheck, LineChart, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: ClipboardCheck,
    title: "Kiểm tra đầu vào",
    text: "Học viên làm bài đánh giá ngắn để xác định trình độ, mục tiêu và khung giờ học phù hợp.",
  },
  {
    icon: BookOpenCheck,
    title: "Xếp lớp đúng lộ trình",
    text: "Tư vấn viên đề xuất khóa học theo năng lực hiện tại: trẻ em, giao tiếp, IELTS hoặc 1 kèm 1.",
  },
  {
    icon: MessageCircle,
    title: "Luyện phản xạ trên lớp",
    text: "Lớp nhỏ, nhiều tương tác, giáo viên sửa lỗi phát âm và cách dùng câu ngay trong buổi học.",
  },
  {
    icon: LineChart,
    title: "Theo dõi tiến bộ",
    text: "Sau mỗi chặng học, học viên nhận nhận xét cụ thể để biết mình đã tốt lên ở đâu.",
  },
]

export function LearningPathSection() {
  return (
    <section className="reveal-section bg-[#111b21] py-24 text-white">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="mb-4 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#25d366]">
            Lộ trình học
          </p>
          <h2 className="max-w-[520px] text-[34px] font-medium leading-[1.08] tracking-tight md:text-[52px]">
            Không học theo cảm tính. Mỗi học viên có một đường đi rõ ràng.
          </h2>
          <p className="mt-6 max-w-[480px] text-[18px] leading-relaxed text-white/72">
            RosyClass bắt đầu bằng đánh giá năng lực, sau đó ghép lớp và đo tiến bộ theo từng giai đoạn để phụ huynh và học viên luôn biết mình đang ở đâu.
          </p>
          <Link
            href="/kiem-tra-trinh-do"
            className="mt-8 inline-flex items-center rounded-full bg-[#25d366] px-6 py-3 text-[15px] font-semibold text-[#111b21] transition-colors hover:bg-white"
          >
            Kiểm tra trình độ miễn phí
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <article
                key={step.title}
                className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-[#111b21]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[38px] font-medium leading-none text-white/14">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-[22px] font-medium tracking-tight">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/68">{step.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
