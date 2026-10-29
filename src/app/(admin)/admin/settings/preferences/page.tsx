import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { getSiteSettings } from "@/lib/get-site-settings"
import PreferencesClient from "./preferences-client"

export default async function PreferencesPage() {
  const user = await requireAdminUser()
  const siteSettings = await getSiteSettings()

  // Tab VietQR là cấu hình chung của trung tâm, chỉ người được sửa cài đặt mới thấy
  return <PreferencesClient user={user} siteSettings={siteSettings} canManagePayment={hasPermission(user, PERMISSIONS.settingsWrite)} />
}
