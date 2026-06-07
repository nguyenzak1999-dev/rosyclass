import { requireAdminUser } from "@/lib/auth/permissions"
import PreferencesClient from "./preferences-client"

export default async function PreferencesPage() {
  const user = await requireAdminUser()

  return <PreferencesClient user={user} />
}
