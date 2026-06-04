import { getSiteSettings } from "@/lib/get-site-settings"
import SiteSettingsClient from "./site-settings-client"

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings()
  return <SiteSettingsClient settings={settings} />
}
