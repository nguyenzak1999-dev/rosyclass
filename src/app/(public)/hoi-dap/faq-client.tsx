"use client"

import { motion } from "framer-motion"
import { HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

interface FAQ {
  q: string
  a: string
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-24 pb-16 bg-[#fcf5eb] overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 mr-2 text-[#25d366]" /> Hỏi đáp
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight"
          >
            Câu hỏi thường gặp
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed"
          >
            Mọi thắc mắc của bạn về khóa học, lộ trình và chính sách học phí đều được giải đáp tại đây.
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto">
          {faqs.length === 0 ? (
            <div className="text-center text-stone py-20">Chưa có câu hỏi nào.</div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  className={`border rounded-[16px] overflow-hidden transition-colors ${openIndex === idx ? 'border-[#25d366] bg-[#d9fdd3]/20' : 'border-[#e9edef] bg-white hover:border-[#25d366]/50'}`}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex items-center justify-between"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  >
                    <span className="font-medium text-[#111b21] text-[16px] pr-4 leading-snug">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#54656f] shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-[#25d366]' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openIndex === idx ? 'auto' : 0, opacity: openIndex === idx ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 text-[#54656f] text-[15px] leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
