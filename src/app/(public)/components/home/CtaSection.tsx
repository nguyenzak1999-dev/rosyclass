import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="reveal-section py-[120px] px-4 text-center mt-[40px]">
      <div className="max-w-[800px] mx-auto flex flex-col items-center">
        <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] tracking-tight">
          Phát triển tương lai
        </h2>
        <p className="text-[18px] md:text-[20px] text-[#54656f] leading-[1.4] mb-10 max-w-[600px]">
          RosyClass giúp bạn mở ra cánh cửa toàn cầu để mang lại những cơ hội tuyệt vời. Phát triển tiếng Anh, tăng cơ hội nghề nghiệp, và xây dựng mối quan hệ.
        </p>
        <Link href="/dang-ky">
          <Button className="group relative overflow-hidden bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[32px] py-[16px] h-auto font-semibold text-[18px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300">
            <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10">Đăng ký ngay</span>
          </Button>
        </Link>
      </div>
    </section>
  )
}
