import { redirect } from "next/navigation"
import { hasPermission, PERMISSIONS, requireAdminUser, type PermissionCode } from "@/lib/auth/permissions"

const permissionBySegment: Record<string, PermissionCode> = {
  attendance: PERMISSIONS.attendanceRead,
  classes: PERMISSIONS.classesRead,
  courses: PERMISSIONS.coursesRead,
  curriculums: PERMISSIONS.coursesRead,
  dashboard: PERMISSIONS.dashboardRead,
  leads: PERMISSIONS.leadsRead,
  media: PERMISSIONS.mediaRead,
  parents: PERMISSIONS.parentsRead,
  payments: PERMISSIONS.paymentsRead,
  reports: PERMISSIONS.reportsRead,
  schedules: PERMISSIONS.schedulesRead,
  students: PERMISSIONS.studentsRead,
  teach: PERMISSIONS.attendanceRead,
  teachers: PERMISSIONS.teachersRead,
  cms: PERMISSIONS.cmsRead,
  settings: PERMISSIONS.settingsRead,
}

export function createPermissionLayout(segment: keyof typeof permissionBySegment) {
  return async function PermissionLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const user = await requireAdminUser()
    if (!hasPermission(user, permissionBySegment[segment])) {
      redirect("/admin/forbidden")
    }

    return children
  }
}
