"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { SiteSettings } from "@/lib/site-settings"

export type HomeFaqItem = {
  question: string
  answer: string
}

export function HomeFaqSection({ settings, faqs }: { settings?: SiteSettings; faqs: HomeFaqItem[] }) {
  const badge = settings?.faqBadge || "Câu hỏi thường gặp"
  const title = settings?.faqTitle || "Những điều phụ huynh và học viên thường hỏi trước khi bắt đầu."
  const buttonText = settings?.faqButtonText || "Xem thêm câu hỏi"
  const buttonLink = settings?.faqButtonLink || "/hoi-dap"

  const [openIndex, setOpenIndex] = useState<number | null>(null)

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

        <div className="divide-y divide-[#e9edef] rounded-[24px] border border-[#e9edef] bg-[#fcf5eb] overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <article key={index}>
                <button
                  className="flex w-full items-center justify-between p-6 text-left md:p-7"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <h3 className="text-[18px] font-semibold leading-snug text-[#111b21] pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#54656f] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#008069]" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[16px] leading-relaxed text-[#54656f] md:px-7 md:pb-7">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
