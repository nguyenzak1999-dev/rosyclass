import Link from "next/link"
import { SiteSettings } from "@/lib/site-settings"

export function HomeFaqSection({ settings }: { settings?: SiteSettings }) {
  const badge = settings?.faqBadge || "Câu hỏi thường gặp"
  const title = settings?.faqTitle || "Những điều phụ huynh và học viên thường hỏi trước khi bắt đầu."
  const buttonText = settings?.faqButtonText || "Xem thêm câu hỏi"
  const buttonLink = settings?.faqButtonLink || "/hoi-dap"
  const faqs = settings?.faqs || []

  if (faqs.length === 0) return null;

  return (
    <section className="reveal-section bg-white py-24">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#008069]">
            {badge}
          </p>
          <h2 className="text-[34px] font-medium leading-[1.1] tracking-tight text-[#111b21] md:text-[48px]">
            {title}
          </h2>
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="mt-8 inline-flex items-center rounded-full bg-[#25d366] px-6 py-3 text-[15px] font-semibold text-[#111b21] transition-colors hover:bg-[#111b21] hover:text-white"
            >
              {buttonText}
            </Link>
          )}
        </div>

        <div className="divide-y divide-[#e9edef] rounded-[24px] border border-[#e9edef] bg-[#fcf5eb]">
          {faqs.map((faq, index) => (
            <article key={index} className="p-6 md:p-7">
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
