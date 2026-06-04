import Link from "next/link"

const faqs = [
  {
    question: "Học thử và kiểm tra trình độ có mất phí không?",
    answer: "RosyClass hỗ trợ kiểm tra trình độ miễn phí. Sau bài test, tư vấn viên đề xuất lớp và lộ trình phù hợp trước khi bạn quyết định đăng ký.",
  },
  {
    question: "Một lớp có bao nhiêu học viên?",
    answer: "Lớp được giữ ở quy mô nhỏ để giáo viên có thời gian sửa lỗi phát âm, theo dõi phản xạ nói và hỗ trợ từng học viên trong buổi học.",
  },
  {
    question: "Phụ huynh theo dõi tiến bộ của con bằng cách nào?",
    answer: "Trung tâm có nhận xét định kỳ về chuyên cần, mức độ tham gia, điểm mạnh và phần cần luyện thêm để phụ huynh nắm được tiến độ.",
  },
  {
    question: "Nếu nghỉ một buổi thì có được học bù không?",
    answer: "Tư vấn viên sẽ hỗ trợ sắp xếp phương án phù hợp theo quy định từng lớp và tình trạng lịch học hiện tại.",
  },
]

export function HomeFaqSection() {
  return (
    <section className="reveal-section bg-white py-24">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#008069]">
            Câu hỏi thường gặp
          </p>
          <h2 className="text-[34px] font-medium leading-[1.1] tracking-tight text-[#111b21] md:text-[48px]">
            Những điều phụ huynh và học viên thường hỏi trước khi bắt đầu.
          </h2>
          <Link
            href="/hoi-dap"
            className="mt-8 inline-flex items-center rounded-full bg-[#25d366] px-6 py-3 text-[15px] font-semibold text-[#111b21] transition-colors hover:bg-[#111b21] hover:text-white"
          >
            Xem thêm câu hỏi
          </Link>
        </div>

        <div className="divide-y divide-[#e9edef] rounded-[24px] border border-[#e9edef] bg-[#fcf5eb]">
          {faqs.map((faq) => (
            <article key={faq.question} className="p-6 md:p-7">
              <h3 className="text-[20px] font-semibold leading-snug text-[#111b21]">
                {faq.question}
              </h3>
              <p className="mt-3 text-[16px] leading-relaxed text-[#54656f]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
