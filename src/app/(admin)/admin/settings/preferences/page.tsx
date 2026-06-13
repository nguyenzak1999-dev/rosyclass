import { requireAdminUser } from "@/lib/auth/permissions"
import { getSiteSettings } from "@/lib/get-site-settings"
import PreferencesClient from "./preferences-client"

export default async function PreferencesPage() {
  const user = await requireAdminUser()
  const siteSettings = await getSiteSettings()

  return <PreferencesClient user={user} siteSettings={siteSettings} />
}
