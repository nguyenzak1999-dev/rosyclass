import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata, JsonLd } from "@/lib/seo"
import FAQClient from "./faq-client"

export const metadata: Metadata = createPageMetadata({
  title: "Hỏi đáp",
  description: "Giải đáp các câu hỏi thường gặp về khóa học, học phí, học thử, kiểm tra trình độ và chính sách học bù tại RosyClass.",
  path: "/hoi-dap",
})

export default async function FAQPage() {
  const faqs = await prisma.faq.findMany({
    where: {
      status: {
        in: ["ACTIVE", "PUBLISHED"],
      },
    },
    orderBy: [
      { position: "asc" },
      { createdAt: "asc" },
    ],
  })
  const faqItems = faqs.map((faq) => ({ q: faq.question, a: faq.answer }))

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }}
      />
      <FAQClient faqs={faqItems} />
    </>
  )
}
