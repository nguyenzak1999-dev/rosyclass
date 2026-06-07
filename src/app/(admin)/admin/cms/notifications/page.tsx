import { getSiteSettings } from "@/lib/get-site-settings"
import NotificationsCmsClient from "./notifications-client"

export default async function NotificationsCmsPage() {
  const settings = await getSiteSettings()
  return <NotificationsCmsClient settings={settings} />
}
