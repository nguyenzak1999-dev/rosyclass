// Tạo tài khoản quản trị hoặc đổi mật khẩu, chạy trên D1 thật qua `cf`.
// Mật khẩu được hỏi khi chạy (không hiện khi gõ, không lưu vào lịch sử shell).
//
//   npm run admin:create -- admin@rosyclass.edu.vn "Admin Rossy"
//
// Email chưa tồn tại thì tạo tài khoản SUPER_ADMIN; đã tồn tại thì chỉ đổi mật khẩu.
import { randomUUID } from "node:crypto"
import { createInterface } from "node:readline"
import { hashPassword } from "../src/lib/auth/password"
import { nowIso, queryRows, runSql, sqlString } from "./lib/d1"

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const output = rl as unknown as { _writeToOutput: (text: string) => void }
    let prompted = false
    output._writeToOutput = (text: string) => {
      // In câu hỏi một lần, sau đó ẩn mọi ký tự gõ vào
      if (!prompted) {
        process.stdout.write(text)
        prompted = true
      }
    }
    rl.question(question, (answer) => {
      rl.close()
      process.stdout.write("\n")
      resolve(answer)
    })
  })
}

const [rawEmail, fullName = "Quản trị viên"] = process.argv.slice(2)
const email = rawEmail?.trim().toLowerCase()

if (!email || !email.includes("@")) {
  console.error('Cách dùng: npm run admin:create -- <email> ["Họ tên"]')
  process.exit(1)
}

const password = await askHidden("Mật khẩu mới (≥ 8 ký tự): ")
if (password.length < 8) {
  console.error("Mật khẩu phải có ít nhất 8 ký tự")
  process.exit(1)
}
if ((await askHidden("Nhập lại mật khẩu: ")) !== password) {
  console.error("Hai lần nhập không khớp")
  process.exit(1)
}

const passwordHash = await hashPassword(password)
const now = nowIso()
const existing = queryRows<{ id: string }>(`SELECT "id" FROM "User" WHERE "email" = ${sqlString(email)}`)

if (existing.length > 0) {
  runSql(`UPDATE "User" SET "passwordHash" = ${sqlString(passwordHash)}, "status" = 'ACTIVE', "updatedAt" = ${sqlString(now)} WHERE "email" = ${sqlString(email)}`)
  console.log(`Đã đổi mật khẩu cho ${email}`)
} else {
  const [role] = queryRows<{ id: string }>(`SELECT "id" FROM "Role" WHERE "code" = 'SUPER_ADMIN'`)
  if (!role) {
    console.error("Chưa có vai trò SUPER_ADMIN. Chạy trước: npm run db:bootstrap")
    process.exit(1)
  }
  runSql(
    `INSERT INTO "User" ("id","email","passwordHash","fullName","status","roleId","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(email)},${sqlString(passwordHash)},${sqlString(fullName)},'ACTIVE',${sqlString(role.id)},${sqlString(now)},${sqlString(now)})`
  )
  console.log(`Đã tạo tài khoản SUPER_ADMIN ${email}`)
}
