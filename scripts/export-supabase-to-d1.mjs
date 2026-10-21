// Xuất toàn bộ dữ liệu từ Supabase Postgres thành file SQL để nạp vào Cloudflare D1.
//
//   SUPABASE_DATABASE_URL="postgresql://..." node scripts/export-supabase-to-d1.mjs
//   npx wrangler d1 execute rosyclass-db --remote --file=.cloudflare/d1-data.sql
//
// File kết quả chứa dữ liệu cá nhân và hash mật khẩu: không commit, xoá sau khi nạp xong.
import { mkdirSync, writeFileSync } from "node:fs"
import pg from "pg"

const connectionString = process.env.SUPABASE_DATABASE_URL
if (!connectionString) {
  console.error("Thiếu SUPABASE_DATABASE_URL (dùng connection string trực tiếp, không qua pooler)")
  process.exit(1)
}

// Prisma lưu DateTime dạng `timestamp(3)` không múi giờ nhưng giá trị là UTC;
// mặc định pg lại hiểu theo giờ máy nên phải ép đọc theo UTC
pg.types.setTypeParser(1114, (value) => new Date(`${value.replace(" ", "T")}Z`))

// Thứ tự theo quan hệ khoá ngoại (bảng cha trước) để dễ đọc; FK được hoãn kiểm tra nên không bắt buộc
const TABLES = [
  "Role", "Permission", "RolePermission", "User",
  "Branch", "Room", "Course", "Teacher", "Parent", "Student",
  "Lead", "LeadNote",
  "Class", "ClassStudent", "ClassSchedule", "ClassSession", "Attendance",
  "Payment", "PaymentLineItem",
  "PlacementQuestion", "PlacementTest", "Score", "ClassNote",
  "Page", "Faq", "BlogPost", "Banner", "MediaFile", "Testimonial",
  "Notification", "ActivityLog", "TeacherPayroll",
]

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL"
  if (value instanceof Date) return `'${value.toISOString().replace("Z", "+00:00")}'`
  if (typeof value === "boolean") return value ? "1" : "0"
  if (typeof value === "number" || typeof value === "bigint") return String(value)
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  return `'${String(value).replace(/'/g, "''")}'`
}

function insert(table, row) {
  const columns = Object.keys(row)
  return `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${columns.map((c) => sqlValue(row[c])).join(", ")});`
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
await client.connect()

// Mật khẩu bcrypt của Supabase Auth, ghép vào User.passwordHash theo email
const { rows: authUsers } = await client.query(
  "SELECT lower(email) AS email, encrypted_password FROM auth.users WHERE email IS NOT NULL AND encrypted_password IS NOT NULL"
)
const passwordByEmail = new Map(authUsers.map((user) => [user.email, user.encrypted_password]))

const lines = ["PRAGMA defer_foreign_keys = on;"]
const summary = []

for (const table of TABLES) {
  const { rows } = await client.query(`SELECT * FROM "${table}"`)

  for (const row of rows) {
    if (table === "User") {
      row.email = row.email.trim().toLowerCase()
      row.passwordHash = passwordByEmail.get(row.email) || row.passwordHash
    }
    lines.push(insert(table, row))
  }

  summary.push(`${table}: ${rows.length}`)
}

await client.end()

mkdirSync(".cloudflare", { recursive: true })
writeFileSync(".cloudflare/d1-data.sql", `${lines.join("\n")}\n`)

const usersWithPassword = authUsers.length
console.log(summary.join("\n"))
console.log(`\nĐã ghép ${usersWithPassword} mật khẩu từ Supabase Auth.`)
console.log("Đã ghi .cloudflare/d1-data.sql")
