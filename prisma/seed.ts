import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

import { PERMISSIONS } from "../src/lib/auth/permission-definitions"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SLUG } from "../src/lib/site-settings"

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function findOrCreateBranch() {
  const existing = await prisma.branch.findFirst({
    where: {
      name: "RosyClass Gia Lâm",
    },
  })
  if (existing) return existing

  return prisma.branch.create({
    data: {
      name: "RosyClass Gia Lâm",
      address: "Gia Lâm, Hà Nội, Việt Nam",
      phone: "0988888888",
    },
  })
}

async function findOrCreateRoom(branchId: string) {
  const existing = await prisma.room.findFirst({
    where: {
      branchId,
      name: "Phòng Cambridge",
    },
  })
  if (existing) return existing

  return prisma.room.create({
    data: {
      name: "Phòng Cambridge",
      capacity: 15,
      branchId,
    },
  })
}

async function findOrCreateBanner() {
  const existing = await prisma.banner.findFirst({
    where: {
      title: "RosyClass English Center",
    },
  })
  if (existing) return existing

  return prisma.banner.create({
    data: {
      title: "RosyClass English Center",
      subtitle: "Lớp nhỏ, lộ trình rõ ràng, theo sát tiến bộ từng học viên.",
      image: "/english-center-hero.png",
      buttonText: "Đăng ký học thử",
      buttonUrl: "/dang-ky",
      position: 1,
      isActive: true,
    },
  })
}

async function findOrCreateFaq(question: string, answer: string, position: number) {
  const existing = await prisma.faq.findFirst({ where: { question } })
  if (existing) return existing

  return prisma.faq.create({
    data: {
      question,
      answer,
      position,
      status: "ACTIVE",
    },
  })
}

async function findOrCreateTestimonial(authorName: string, content: string, authorTitle: string) {
  const existing = await prisma.testimonial.findFirst({ where: { authorName } })
  if (existing) return existing

  return prisma.testimonial.create({
    data: {
      authorName,
      authorTitle,
      content,
      rating: 5,
      isPublished: true,
    },
  })
}

async function findOrCreateQuestion(data: {
  type: string
  question: string
  options: string[]
  correctIndex: number
  order: number
}) {
  const existing = await prisma.placementQuestion.findFirst({
    where: {
      question: data.question,
    },
  })
  if (existing) return existing

  return prisma.placementQuestion.create({
    data: {
      type: data.type,
      question: data.question,
      options: JSON.stringify(data.options),
      correctIndex: data.correctIndex,
      order: data.order,
      isPublished: true,
    },
  })
}

async function main() {
  console.log("Seeding RosyClass data...")

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: "SUPER_ADMIN" },
      update: {},
      create: {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        isSystem: true,
        description: "Toàn quyền hệ thống",
      },
    }),
    prisma.role.upsert({
      where: { code: "ADMIN" },
      update: {},
      create: {
        name: "Admin",
        code: "ADMIN",
        isSystem: true,
        description: "Quản trị trung tâm",
      },
    }),
    prisma.role.upsert({
      where: { code: "CONSULTANT" },
      update: {},
      create: {
        name: "Tư vấn viên",
        code: "CONSULTANT",
        isSystem: true,
        description: "Phụ trách leads và tuyển sinh",
      },
    }),
    prisma.role.upsert({
      where: { code: "ACCOUNTANT" },
      update: {},
      create: {
        name: "Kế toán",
        code: "ACCOUNTANT",
        isSystem: true,
        description: "Phụ trách học phí và thanh toán",
      },
    }),
    prisma.role.upsert({
      where: { code: "TEACHER" },
      update: {},
      create: {
        name: "Giáo viên",
        code: "TEACHER",
        isSystem: true,
        description: "Giáo viên",
      },
    }),
  ])

  const superAdminRole = roles[0]

  await prisma.permission.createMany({
    data: Object.values(PERMISSIONS).map((code) => ({
      code,
      module: code.split(".")[0],
      description: code,
    })),
    skipDuplicates: true,
  })

  const permissions = await prisma.permission.findMany()
  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: superAdminRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@rosyclass.edu.vn" },
    update: {
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
    create: {
      email: "admin@rosyclass.edu.vn",
      fullName: "Rosy Admin",
      passwordHash: "dummy_hash_for_supabase_auth",
      roleId: superAdminRole.id,
      phone: "0988888888",
    },
  })

  const branch = await findOrCreateBranch()
  const room = await findOrCreateRoom(branch.id)

  const course = await prisma.course.upsert({
    where: { slug: "ielts-foundation" },
    update: {
      isPublished: true,
      status: "PUBLISHED",
    },
    create: {
      name: "IELTS Foundation",
      slug: "ielts-foundation",
      level: "IELTS_FOUNDATION",
      description: "Khóa học nền tảng IELTS cho học viên mới bắt đầu, tập trung từ vựng học thuật, ngữ pháp lõi và chiến lược làm bài.",
      targetAudience: "Học sinh cấp 2, cấp 3 và sinh viên cần xây nền IELTS.",
      learningOutcomes: "Nắm cấu trúc 4 kỹ năng IELTS\nXây nền từ vựng học thuật cơ bản\nHoàn thành bài đọc/nghe ngắn đúng chiến thuật\nSẵn sàng chuyển lên lộ trình IELTS 5.5+",
      totalSessions: 24,
      sessionDurationMinutes: 90,
      tuitionFee: 5000000,
      salePrice: 4500000,
      thumbnail: "/english-center-hero.png",
      isPublished: true,
      status: "PUBLISHED",
    },
  })

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@rosyclass.edu.vn" },
    update: {
      status: "ACTIVE",
    },
    create: {
      email: "teacher@rosyclass.edu.vn",
      fullName: "Nguyễn Minh Anh",
      passwordHash: "dummy_hash_for_supabase_auth",
      roleId: roles[4].id,
      phone: "0977777777",
      status: "ACTIVE",
    },
  })

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {
      status: "ACTIVE",
      showOnHomepage: true,
    },
    create: {
      userId: teacherUser.id,
      fullName: "Nguyễn Minh Anh",
      phone: "0977777777",
      email: "teacher@rosyclass.edu.vn",
      bio: "Giáo viên IELTS có kinh nghiệm xây nền cho học viên mất gốc và theo sát từng giai đoạn tiến bộ.",
      specialties: "IELTS Foundation, Grammar, Speaking",
      certificates: "TESOL, IELTS 8.0",
      hourlyRate: 300000,
      status: "ACTIVE",
      showOnHomepage: true,
    },
  })

  const existingClass = await prisma.class.findFirst({
    where: {
      name: "IELTS Foundation tối 2-4",
    },
  })

  const classItem = existingClass || await prisma.class.create({
    data: {
      name: "IELTS Foundation tối 2-4",
      maxStudents: 12,
      startDate: new Date("2026-07-06T12:00:00.000Z"),
      expectedEndDate: new Date("2026-09-30T12:00:00.000Z"),
      status: "UPCOMING",
      courseId: course.id,
      teacherId: teacher.id,
      branchId: branch.id,
      roomId: room.id,
    },
  })

  const existingSchedule = await prisma.classSchedule.findFirst({
    where: {
      classId: classItem.id,
      dayOfWeek: 1,
      startTime: "19:30",
    },
  })

  if (!existingSchedule) {
    await prisma.classSchedule.createMany({
      data: [
        {
          classId: classItem.id,
          roomId: room.id,
          teacherId: teacher.id,
          dayOfWeek: 1,
          startTime: "19:30",
          endTime: "21:00",
        },
        {
          classId: classItem.id,
          roomId: room.id,
          teacherId: teacher.id,
          dayOfWeek: 3,
          startTime: "19:30",
          endTime: "21:00",
        },
      ],
    })
  }

  await prisma.page.upsert({
    where: { slug: SITE_SETTINGS_SLUG },
    update: {},
    create: {
      slug: SITE_SETTINGS_SLUG,
      title: "Cài đặt website",
      content: JSON.stringify(DEFAULT_SITE_SETTINGS),
      status: "ACTIVE",
    },
  })

  await findOrCreateBanner()
  await findOrCreateFaq("Kiểm tra trình độ có mất phí không?", "RosyClass hỗ trợ kiểm tra trình độ miễn phí trước khi tư vấn lớp phù hợp.", 1)
  await findOrCreateFaq("Một lớp có bao nhiêu học viên?", "Lớp học được giữ quy mô nhỏ để giáo viên có thời gian sửa lỗi và theo sát từng học viên.", 2)
  await findOrCreateFaq("Nếu nghỉ học có được học bù không?", "Trung tâm hỗ trợ sắp xếp học bù theo tình trạng lớp và quy định từng khóa.", 3)
  await findOrCreateTestimonial("Mai Phương", "Sau 3 tháng học giao tiếp tại RosyClass, mình tự tin trao đổi với khách hàng nước ngoài hơn rất nhiều.", "Học viên giao tiếp")
  await findOrCreateTestimonial("Anh Tuấn", "Lộ trình IELTS rõ ràng, bài tập vừa sức và giáo viên sửa lỗi rất kỹ sau từng buổi.", "Học viên IELTS Foundation")

  await findOrCreateQuestion({
    type: "Ngữ pháp",
    question: "Choose the correct answer: I _____ to class yesterday.",
    options: ["go", "goes", "went", "gone"],
    correctIndex: 2,
    order: 1,
  })
  await findOrCreateQuestion({
    type: "Từ vựng",
    question: "What is the closest meaning of enormous?",
    options: ["Tiny", "Huge", "Quiet", "Fast"],
    correctIndex: 1,
    order: 2,
  })
  await findOrCreateQuestion({
    type: "Đọc hiểu",
    question: "If someone says it is raining heavily, which sentence has the same meaning?",
    options: ["It is sunny.", "It is raining a lot.", "It is windy.", "It is snowing."],
    correctIndex: 1,
    order: 3,
  })

  await prisma.activityLog.create({
    data: {
      action: "seed.initial_data",
      entityType: "system",
      details: "Seeded RosyClass baseline CMS and academic data.",
      userId: admin.id,
    },
  })

  console.log("Seeding completed successfully.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
