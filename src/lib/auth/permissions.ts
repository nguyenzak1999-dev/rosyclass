import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { hasPermission, PERMISSIONS, type AdminUser, type PermissionCode } from "@/lib/auth/permission-definitions"

const allPermissions = Object.values(PERMISSIONS)

const roleFallbackPermissions: Record<string, PermissionCode[]> = {
  SUPER_ADMIN: allPermissions,
  ADMIN: allPermissions.filter((permission) => permission !== PERMISSIONS.settingsWrite),
  STAFF: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.leadsRead,
    PERMISSIONS.leadsWrite,
    PERMISSIONS.studentsRead,
    PERMISSIONS.studentsWrite,
    PERMISSIONS.parentsRead,
    PERMISSIONS.parentsWrite,
    PERMISSIONS.coursesRead,
    PERMISSIONS.classesRead,
    PERMISSIONS.schedulesRead,
    PERMISSIONS.attendanceRead,
    PERMISSIONS.mediaRead,
  ],
  CONSULTANT: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.leadsRead,
    PERMISSIONS.leadsWrite,
    PERMISSIONS.studentsRead,
    PERMISSIONS.studentsWrite,
    PERMISSIONS.parentsRead,
    PERMISSIONS.coursesRead,
    PERMISSIONS.classesRead,
    PERMISSIONS.schedulesRead,
  ],
  ACCOUNTANT: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.studentsRead,
    PERMISSIONS.parentsRead,
    PERMISSIONS.paymentsRead,
    PERMISSIONS.paymentsWrite,
  ],
  TEACHER: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.studentsRead,
    PERMISSIONS.classesRead,
    PERMISSIONS.schedulesRead,
    PERMISSIONS.attendanceRead,
    PERMISSIONS.attendanceWrite,
  ],
}

export class AuthorizationError extends Error {
  constructor(message = "Bạn không có quyền thực hiện thao tác này") {
    super(message)
    this.name = "AuthorizationError"
  }
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser?.email) return null

  const user = await prisma.user.findUnique({
    where: {
      email: authUser.email,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!user || user.status !== "ACTIVE") return null

  const dbPermissions = user.role.permissions
    .map(({ permission }) => permission.code)
    .filter((permission): permission is PermissionCode => allPermissions.includes(permission as PermissionCode))
  const fallbackPermissions = roleFallbackPermissions[user.role.code] || []
  const permissions = user.role.code === "SUPER_ADMIN" ? allPermissions : Array.from(new Set([...dbPermissions, ...fallbackPermissions]))

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roleCode: user.role.code,
    roleName: user.role.name,
    permissions,
  }
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser()
  if (!user) redirect("/admin-login")
  return user
}

export async function requirePermission(permission: PermissionCode) {
  const user = await requireAdminUser()
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError()
  }
  return user
}

export { hasPermission, PERMISSIONS }
export type { AdminUser, PermissionCode }
