import { getSiteSettings } from "@/lib/get-site-settings"
import { ContactClient } from "./contact-client"
import { Metadata } from "next"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("lien-he", {
    title: "Liên hệ",
    description: "Liên hệ RosyClass — trung tâm tiếng Anh cho trẻ mầm non và tiểu học tại Dương Xá, Gia Lâm, Hà Nội — để được tư vấn lộ trình học phù hợp cho bé.",
    path: "/lien-he",
  })
}

async function ContactPageContent() {
  const siteSettings = await getSiteSettings()

  return <ContactClient settings={siteSettings} />
}

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function ContactPage() {
  return (
    <DesignedPage slug="lien-he">
      <ContactPageContent />
    </DesignedPage>
  )
}
