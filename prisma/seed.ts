import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding data...')

  // 1. Roles & Permissions
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      isSystem: true,
      description: 'System Administrator with all permissions',
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      name: 'Admin',
      code: 'ADMIN',
      isSystem: true,
      description: 'Center Administrator',
    },
  })

  const teacherRole = await prisma.role.upsert({
    where: { code: 'TEACHER' },
    update: {},
    create: {
      name: 'Teacher',
      code: 'TEACHER',
      isSystem: true,
      description: 'Teacher',
    },
  })

  // 2. Initial Admin User
  await prisma.user.upsert({
    where: { email: 'admin@rosyclass.edu.vn' },
    update: {},
    create: {
      email: 'admin@rosyclass.edu.vn',
      fullName: 'Rosy Admin',
      passwordHash: 'dummy_hash_for_now_or_use_supabase_auth',
      roleId: superAdminRole.id,
      phone: '0123456789',
    },
  })

  // 3. Branches
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'Trụ sở chính Gia Lâm',
      address: 'Gia Lâm, Hà Nội, Việt Nam',
      phone: '0988888888',
    },
  })

  // 4. Rooms
  await prisma.room.createMany({
    data: [
      { name: 'Phòng 101', capacity: 15, branchId: mainBranch.id },
      { name: 'Phòng 102', capacity: 20, branchId: mainBranch.id },
    ],
  })

  // 5. Courses
  const ieltsFoundation = await prisma.course.create({
    data: {
      name: 'IELTS Foundation',
      slug: 'ielts-foundation',
      level: 'IELTS_FOUNDATION',
      description: 'Khóa học nền tảng IELTS cho người mới bắt đầu.',
      targetAudience: 'Học sinh cấp 2, 3 và sinh viên.',
      learningOutcomes: 'Đạt tối thiểu 4.5 IELTS.',
      totalSessions: 24,
      sessionDurationMinutes: 90,
      tuitionFee: 5000000,
      isPublished: true,
      status: 'ACTIVE',
    },
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
