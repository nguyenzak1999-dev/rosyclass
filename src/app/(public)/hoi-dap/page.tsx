import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { JsonLd } from "@/lib/seo"
import FAQClient from "./faq-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("hoi-dap", {
    title: "Hỏi đáp",
    description: "Giải đáp những câu hỏi ba mẹ thường gặp về chương trình tiếng Anh cho bé mầm non và tiểu học, học phí, học thử, kiểm tra trình độ và học bù tại RosyClass.",
    path: "/hoi-dap",
  })
}

async function FAQPageContent() {
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

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function FAQPage() {
  return (
    <DesignedPage slug="hoi-dap">
      <FAQPageContent />
    </DesignedPage>
  )
}
