import Link from "next/link"
import Image from "next/image"

export function FeatureSections() {
  return (
    <div className="space-y-[160px] py-[80px]">

      {/* Feature 1: Never miss a moment */}
      <section className="reveal-section max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
        <div className="w-full md:w-[45%] aspect-[4/3] rounded-[32px] overflow-hidden relative border-0">
          <Image src="/hero_slider_2.png" alt="Video calls" fill className="object-cover" />
        </div>
        <div className="w-full md:w-[45%] space-y-6">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] leading-[1.1] tracking-tight">
            Không bỏ lỡ khoảnh khắc với giáo viên bản ngữ
          </h2>
          <p className="text-[18px] text-[#1c1e21] font-normal leading-[1.4]">
            Từ các lớp học nhóm đến các buổi luyện nói 1 kèm 1, cảm giác như đang trò chuyện trực tiếp cùng giáo viên thông qua phương pháp tương tác cao.
          </p>
          <Link href="/giao-vien" className="group inline-flex items-center gap-3 mt-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#e9edef] bg-transparent text-[#111b21] group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </span>
            <span className="font-semibold text-[#111b21] text-[18px] group-hover:text-[#25d366] transition-colors">Gặp gỡ đội ngũ</span>
          </Link>
        </div>
      </section>

      {/* Feature 2: Speak freely */}
      <section className="reveal-section max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-20">
        <div className="w-full md:w-[45%] aspect-[4/3] rounded-[32px] overflow-hidden relative border-0">
          <Image src="/hero_slider_3.png" alt="Speak freely" fill className="object-cover" />
        </div>
        <div className="w-full md:w-[45%] space-y-6">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] leading-[1.1] tracking-tight">
            Giao tiếp tự do
          </h2>
          <p className="text-[18px] text-[#1c1e21] font-normal leading-[1.4]">
            Với lộ trình học cá nhân hóa tại RosyClass, các bài nói và hội thoại của bạn được xây dựng bài bản. Chỉ bạn và giáo viên mới có thể hiểu được sự tiến bộ mỗi ngày.
          </p>
          <Link href="/khoa-hoc" className="group inline-flex items-center gap-3 mt-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#e9edef] bg-transparent text-[#111b21] group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </span>
            <span className="font-semibold text-[#111b21] text-[18px] group-hover:text-[#25d366] transition-colors">Khám phá khóa học</span>
          </Link>
        </div>
      </section>

      {/* Feature 3: Keep in touch with your groups */}
      <section className="reveal-section max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
        <div className="w-full md:w-[45%] aspect-[4/3] rounded-[32px] overflow-hidden relative border-0">
          <Image src="/english-center-hero.png" alt="Groups" fill className="object-cover" />
        </div>
        <div className="w-full md:w-[45%] space-y-6">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] leading-[1.1] tracking-tight">
            Kết nối cùng lớp học nhỏ
          </h2>
          <p className="text-[18px] text-[#1c1e21] font-normal leading-[1.4]">
            Dù là lên kế hoạch thực hành ngoại khóa hay đơn giản là trò chuyện nhóm, các cuộc hội thoại lớp học luôn diễn ra tự nhiên và dễ dàng.
          </p>
          <Link href="/khoa-hoc" className="group inline-flex items-center gap-3 mt-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#e9edef] bg-transparent text-[#111b21] group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </span>
            <span className="font-semibold text-[#111b21] text-[18px] group-hover:text-[#25d366] transition-colors">Tìm hiểu môi trường học</span>
          </Link>
        </div>
      </section>

      {/* Feature 4: Say what you feel */}
      <section className="reveal-section max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-20">
        <div className="w-full md:w-[45%] aspect-[4/3] rounded-[32px] overflow-hidden relative border-0">
          <Image src="/hero_slider_2.png" alt="Say what you feel" fill className="object-cover" />
        </div>
        <div className="w-full md:w-[45%] space-y-6">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] leading-[1.1] tracking-tight">
            Thể hiện bản thân
          </h2>
          <p className="text-[18px] text-[#1c1e21] font-normal leading-[1.4]">
            Thể hiện bản thân không giới hạn. Sử dụng tiếng Anh tự nhiên trong đời sống hàng ngày hoặc chia sẻ những câu chuyện dài hơn về bản thân.
          </p>
          <Link href="/kiem-tra-trinh-do" className="group inline-flex items-center gap-3 mt-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#e9edef] bg-transparent text-[#111b21] group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </span>
            <span className="font-semibold text-[#111b21] text-[18px] group-hover:text-[#25d366] transition-colors">Kiểm tra trình độ</span>
          </Link>
        </div>
      </section>

    </div>
  )
}
