import { getSiteSettings } from "@/lib/get-site-settings"
import HomeCmsClient from "./client"

export default async function HomeCmsPage() {
  const settings = await getSiteSettings()

  return <HomeCmsClient settings={settings} />
}
