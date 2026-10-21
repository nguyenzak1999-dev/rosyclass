// Đặt mật khẩu cho một tài khoản quản trị (thay cho việc tạo user trên Supabase Auth trước đây).
//
//   npx tsx scripts/set-password.ts admin@rosyclass.edu.vn "MatKhauMoi123" ["Họ tên"]
//
// Nếu email chưa tồn tại, script tạo tài khoản mới với vai trò SUPER_ADMIN.
import { createScriptPrisma } from "../prisma/script-client"
import { hashPassword } from "../src/lib/auth/password"

const [rawEmail, password, fullName = "Quản trị viên"] = process.argv.slice(2)

if (!rawEmail || !password || password.length < 8) {
  console.error('Cách dùng: npx tsx scripts/set-password.ts <email> "<mật khẩu ≥ 8 ký tự>" ["Họ tên"]')
  process.exit(1)
}

const email = rawEmail.trim().toLowerCase()
const prisma = createScriptPrisma()

try {
  const passwordHash = await hashPassword(password)
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash } })
    console.log(`Đã đổi mật khẩu cho ${email}`)
  } else {
    const role = await prisma.role.upsert({
      where: { code: "SUPER_ADMIN" },
      update: {},
      create: { code: "SUPER_ADMIN", name: "Super Admin", isSystem: true },
    })
    await prisma.user.create({ data: { email, fullName, passwordHash, roleId: role.id } })
    console.log(`Đã tạo tài khoản SUPER_ADMIN ${email}`)
  }
} finally {
  await prisma.$disconnect()
}
