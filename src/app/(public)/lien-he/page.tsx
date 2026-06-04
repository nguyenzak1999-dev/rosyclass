import { getSiteSettings } from "@/lib/get-site-settings"
import { ContactClient } from "./contact-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Liên hệ | RosyClass",
  description: "Liên hệ với trung tâm tiếng Anh RosyClass để được tư vấn lộ trình học phù hợp nhất.",
}

export default async function ContactPage() {
  const siteSettings = await getSiteSettings()

  return <ContactClient settings={siteSettings} />
}
