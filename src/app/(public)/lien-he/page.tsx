import { getSiteSettings } from "@/lib/get-site-settings"
import { createPageMetadata } from "@/lib/seo"
import { ContactClient } from "./contact-client"
import { Metadata } from "next"

export const metadata: Metadata = createPageMetadata({
  title: "Liên hệ",
  description: "Liên hệ với trung tâm tiếng Anh RosyClass để được tư vấn lộ trình học phù hợp nhất.",
  path: "/lien-he",
})

export default async function ContactPage() {
  const siteSettings = await getSiteSettings()

  return <ContactClient settings={siteSettings} />
}
