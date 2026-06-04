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
      <section className="pt-16 pb-20 bg-sky-gradient overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-pure-white/80 backdrop-blur-md border border-stone/20 px-4 py-1.5 text-[14px] text-midnight-ink font-medium mb-6"
          >
            <HelpCircle className="w-4 h-4 mr-2 text-signal-blue" /> Hỏi đáp
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-midnight-ink mb-6"
          >
            Câu hỏi thường gặp
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-stone text-[18px] leading-relaxed"
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
                  className={`border rounded-2xl overflow-hidden transition-colors ${openIndex === idx ? 'border-signal-blue bg-signal-blue/5' : 'border-stone/20 bg-pure-white hover:border-stone/40'}`}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex items-center justify-between"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  >
                    <span className="font-bold text-midnight-ink text-[16px]">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-stone transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-signal-blue' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openIndex === idx ? 'auto' : 0, opacity: openIndex === idx ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 text-stone text-[15px] leading-relaxed">
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
