// Nạp dữ liệu nền cho database D1 mới: vai trò, quyền và cấu hình website mặc định.
// Chạy lại nhiều lần vẫn an toàn (INSERT OR IGNORE), không ghi đè dữ liệu đã chỉnh.
//
//   npm run db:bootstrap
import { randomUUID } from "node:crypto"
import { PERMISSIONS } from "../src/lib/auth/permission-definitions"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SLUG } from "../src/lib/site-settings"
import { nowIso, queryRows, runSql, sqlString } from "./lib/d1"

const ROLES = [
  { code: "SUPER_ADMIN", name: "Super Admin", description: "Toàn quyền hệ thống" },
  { code: "ADMIN", name: "Admin", description: "Quản trị trung tâm" },
  { code: "CONSULTANT", name: "Tư vấn viên", description: "Phụ trách leads và tuyển sinh" },
  { code: "ACCOUNTANT", name: "Kế toán", description: "Phụ trách học phí và thanh toán" },
  { code: "TEACHER", name: "Giáo viên", description: "Giáo viên" },
]

const now = nowIso()
const statements: string[] = []

for (const role of ROLES) {
  statements.push(
    `INSERT OR IGNORE INTO "Role" ("id","name","code","description","isSystem","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(role.name)},${sqlString(role.code)},${sqlString(role.description)},1,${sqlString(now)},${sqlString(now)})`
  )
}

for (const code of Object.values(PERMISSIONS)) {
  statements.push(
    `INSERT OR IGNORE INTO "Permission" ("id","code","module","description") VALUES (${sqlString(randomUUID())},${sqlString(code)},${sqlString(code.split(".")[0])},${sqlString(code)})`
  )
}

// Super Admin có mọi quyền; các vai trò khác dùng quyền mặc định trong src/lib/auth/permissions.ts
statements.push(
  `INSERT OR IGNORE INTO "RolePermission" ("roleId","permissionId") SELECT r."id", p."id" FROM "Role" r CROSS JOIN "Permission" p WHERE r."code" = 'SUPER_ADMIN'`
)

statements.push(
  `INSERT OR IGNORE INTO "Page" ("id","title","slug","content","status","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},'Cài đặt website',${sqlString(SITE_SETTINGS_SLUG)},${sqlString(JSON.stringify(DEFAULT_SITE_SETTINGS))},'ACTIVE',${sqlString(now)},${sqlString(now)})`
)

runSql(statements.join(";\n"))

const [counts] = queryRows<{ roles: number; permissions: number; settings: number; users: number }>(
  `SELECT (SELECT count(*) FROM "Role") AS roles, (SELECT count(*) FROM "Permission") AS permissions, (SELECT count(*) FROM "Page" WHERE "slug" = '${SITE_SETTINGS_SLUG}') AS settings, (SELECT count(*) FROM "User") AS users`
)
console.log(`Vai trò: ${counts.roles} · Quyền: ${counts.permissions} · Cấu hình website: ${counts.settings} · Tài khoản: ${counts.users}`)
if (!counts.users) console.log("Chưa có tài khoản nào. Tạo admin bằng: npm run admin:create")
