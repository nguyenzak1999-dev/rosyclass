"use client"

import { motion, useReducedMotion } from "framer-motion"
import { HelpCircle, Plus } from "lucide-react"
import { useId, useState } from "react"
import { cn } from "@/lib/utils"
import { EmptyState, KidButton, PageHero, RosyMascot, toneAt, toneClasses } from "@/components/kids"

interface FAQ {
  q: string
  a: string
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()
  const baseId = useId()

  return (
    <div className="flex min-h-screen w-full flex-col pb-24">
      <PageHero
        tone="sun"
        eyebrow="Hỏi đáp"
        eyebrowIcon={<HelpCircle className="h-4 w-4" aria-hidden="true" />}
        title="Câu hỏi thường gặp"
        highlight="thường gặp"
        description="Những thắc mắc ba mẹ hay gửi về chương trình học của bé, lộ trình và học phí đều được giải đáp tại đây."
      />

      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-[820px] px-4 sm:px-8">
          {faqs.length === 0 ? (
            <EmptyState title="Chưa có câu hỏi nào." />
          ) : (
            <div className="space-y-5">
              {faqs.map((faq, idx) => {
                const open = openIndex === idx
                const tone = toneAt(idx)
                const buttonId = `${baseId}-q-${idx}`
                const panelId = `${baseId}-a-${idx}`
                return (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(idx, 6) * 0.05 }}
                    key={idx}
                    className={cn(
                      "kid-border overflow-hidden rounded-kid transition-[background-color,box-shadow] duration-300",
                      open ? cn(toneClasses[tone].soft, "kid-shadow") : "kid-shadow-sm bg-white"
                    )}
                  >
                    <h2>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        className="kid-focus flex w-full items-center justify-between gap-4 rounded-kid px-5 py-5 text-left md:px-6"
                        onClick={() => setOpenIndex(open ? null : idx)}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "kid-border-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-kid-display text-[15px] font-extrabold",
                              open ? "bg-white text-kid-ink" : cn(toneClasses[tone].soft, "text-kid-ink")
                            )}
                          >
                            ?
                          </span>
                          <span className="font-kid-display text-[18px] leading-snug font-bold text-kid-ink md:text-[19px]">{faq.q}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "kid-border-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300",
                            open ? "rotate-45 bg-kid-ink text-white" : "bg-kid-sun text-kid-ink"
                          )}
                        >
                          <Plus className="h-5 w-5" strokeWidth={3} />
                        </span>
                      </button>
                    </h2>
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      aria-hidden={!open}
                      initial={false}
                      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pl-[64px] text-[16px] leading-relaxed whitespace-pre-line text-kid-ink md:px-6 md:pl-[68px]">
                        {faq.a}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="kid-border kid-shadow relative mt-16 flex flex-col items-center gap-5 rounded-kid-lg bg-kid-grape-soft px-6 py-10 text-center sm:flex-row sm:text-left">
            <RosyMascot mood="think" className="kid-float h-24 w-24 shrink-0" />
            <div className="flex-1">
              <p className="font-kid-display text-[24px] leading-tight font-extrabold text-kid-ink">Ba mẹ cần tư vấn thêm?</p>
            </div>
            <KidButton href="/lien-he" tone="sun" size="lg">
              Liên hệ tư vấn
            </KidButton>
          </div>
        </div>
      </section>
    </div>
  )
}
