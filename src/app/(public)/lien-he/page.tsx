import { getSiteSettings } from "@/lib/get-site-settings"
import { createPageMetadata } from "@/lib/seo"
import { ContactClient } from "./contact-client"
import { Metadata } from "next"

export const metadata: Metadata = createPageMetadata({
  title: "Liên hệ",
  description: "Liên hệ RosyClass — trung tâm tiếng Anh cho trẻ mầm non và tiểu học tại Dương Xá, Gia Lâm, Hà Nội — để được tư vấn lộ trình học phù hợp cho bé.",
  path: "/lien-he",
})

export default async function ContactPage() {
  const siteSettings = await getSiteSettings()

  return <ContactClient settings={siteSettings} />
}
