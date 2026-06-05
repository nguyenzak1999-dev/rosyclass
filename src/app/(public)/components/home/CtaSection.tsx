import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteSettings } from "@/lib/site-settings"

export function CtaSection({ settings }: { settings?: SiteSettings }) {
  const title = settings?.ctaTitle || "Phát triển tương lai"
  const description = settings?.ctaDescription || "RosyClass giúp bạn mở ra cánh cửa toàn cầu để mang lại những cơ hội tuyệt vời. Phát triển tiếng Anh, tăng cơ hội nghề nghiệp, và xây dựng mối quan hệ."
  const buttonText = settings?.ctaButtonText || "Đăng ký ngay"
  const buttonLink = settings?.ctaButtonLink || "/dang-ky"

  return (
    <section className="reveal-section py-[120px] px-4 text-center mt-[40px]">
      <div className="max-w-[800px] mx-auto flex flex-col items-center">
        <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] tracking-tight">
          {title}
        </h2>
        <p className="text-[18px] md:text-[20px] text-[#54656f] leading-[1.4] mb-10 max-w-[600px]">
          {description}
        </p>
        {buttonText && buttonLink && (
          <Link href={buttonLink}>
            <Button className="group relative overflow-hidden bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[32px] py-[16px] h-auto font-semibold text-[18px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300">
              <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10">{buttonText}</span>
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
