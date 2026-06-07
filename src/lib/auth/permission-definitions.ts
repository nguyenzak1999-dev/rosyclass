export const PERMISSIONS = {
  dashboardRead: "dashboard.read",
  reportsRead: "reports.read",
  leadsRead: "leads.read",
  leadsWrite: "leads.write",
  studentsRead: "students.read",
  studentsWrite: "students.write",
  parentsRead: "parents.read",
  parentsWrite: "parents.write",
  coursesRead: "courses.read",
  coursesWrite: "courses.write",
  classesRead: "classes.read",
  classesWrite: "classes.write",
  schedulesRead: "schedules.read",
  schedulesWrite: "schedules.write",
  attendanceRead: "attendance.read",
  attendanceWrite: "attendance.write",
  teachersRead: "teachers.read",
  teachersWrite: "teachers.write",
  paymentsRead: "payments.read",
  paymentsWrite: "payments.write",
  cmsRead: "cms.read",
  cmsWrite: "cms.write",
  mediaRead: "media.read",
  mediaWrite: "media.write",
  settingsRead: "settings.read",
  settingsWrite: "settings.write",
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type AdminUser = {
  id: string
  email: string
  fullName: string
  roleCode: string
  roleName: string
  permissions: PermissionCode[]
}

export function hasPermission(user: Pick<AdminUser, "roleCode" | "permissions"> | null, permission: PermissionCode) {
  if (!user) return false
  if (user.roleCode === "SUPER_ADMIN") return true
  return user.permissions.includes(permission)
}

export function canAccessAny(user: Pick<AdminUser, "roleCode" | "permissions"> | null, permissions: PermissionCode[]) {
  return permissions.some((permission) => hasPermission(user, permission))
}
