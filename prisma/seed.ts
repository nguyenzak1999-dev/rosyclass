import { createScriptPrisma } from "./script-client"

import { PERMISSIONS } from "../src/lib/auth/permission-definitions"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SLUG } from "../src/lib/site-settings"

const prisma = createScriptPrisma()

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
}

async function main() {
  console.log("Cleaning up existing database records...")
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.classNote.deleteMany()
  await prisma.score.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.paymentLineItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.placementTest.deleteMany()
  await prisma.placementQuestion.deleteMany()
  await prisma.classStudent.deleteMany()
  await prisma.classSession.deleteMany()
  await prisma.classSchedule.deleteMany()
  await prisma.class.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.parent.deleteMany()
  await prisma.leadNote.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.course.deleteMany()
  await prisma.room.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.banner.deleteMany()

  // Keep admin user to prevent session invalidation
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@rosyclass.edu.vn"
      }
    }
  })

  console.log("Seeding RosyClass system baseline and roles...")

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: "SUPER_ADMIN" },
      update: {},
      create: {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        isSystem: true,
        description: "Toàn quyền hệ thống"
      }
    }),
    prisma.role.upsert({
      where: { code: "ADMIN" },
      update: {},
      create: {
        name: "Admin",
        code: "ADMIN",
        isSystem: true,
        description: "Quản trị trung tâm"
      }
    }),
    prisma.role.upsert({
      where: { code: "CONSULTANT" },
      update: {},
      create: {
        name: "Tư vấn viên",
        code: "CONSULTANT",
        isSystem: true,
        description: "Phụ trách leads và tuyển sinh"
      }
    }),
    prisma.role.upsert({
      where: { code: "ACCOUNTANT" },
      update: {},
      create: {
        name: "Kế toán",
        code: "ACCOUNTANT",
        isSystem: true,
        description: "Phụ trách học phí và thanh toán"
      }
    }),
    prisma.role.upsert({
      where: { code: "TEACHER" },
      update: {},
      create: {
        name: "Giáo viên",
        code: "TEACHER",
        isSystem: true,
        description: "Giáo viên"
      }
    })
  ])

  const superAdminRole = roles[0]
  const consultantRole = roles[2]
  const accountantRole = roles[3]
  const teacherRole = roles[4]

  // SQLite/D1 không hỗ trợ skipDuplicates nên dùng upsert để seed chạy lại được
  for (const code of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, module: code.split(".")[0], description: code }
    })
  }

  const permissions = await prisma.permission.findMany()
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permission.id }
    })
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@rosyclass.edu.vn" },
    update: {
      roleId: superAdminRole.id,
      status: "ACTIVE"
    },
    create: {
      email: "admin@rosyclass.edu.vn",
      fullName: "Rosy Admin",
      passwordHash: "dummy_hash_for_supabase_auth",
      roleId: superAdminRole.id,
      phone: "0988888888"
    }
  })

  // Create staff users
  const consultantUser = await prisma.user.create({
    data: {
      email: "consultant@rosyclass.edu.vn",
      fullName: "Nguyễn Tư Vấn",
      passwordHash: "dummy_hash_for_supabase_auth",
      roleId: consultantRole.id,
      phone: "0912345678"
    }
  })

  const accountantUser = await prisma.user.create({
    data: {
      email: "accountant@rosyclass.edu.vn",
      fullName: "Trần Kế Toán",
      passwordHash: "dummy_hash_for_supabase_auth",
      roleId: accountantRole.id,
      phone: "0987654321"
    }
  })

  // 1. Branches & Rooms
  console.log("Seeding branches and rooms...")
  const branchGL = await prisma.branch.create({
    data: { name: "RosyClass Gia Lâm", address: "Gia Lâm, Hà Nội", phone: "0988888888", isActive: true }
  })
  const branchLB = await prisma.branch.create({
    data: { name: "RosyClass Long Biên", address: "Long Biên, Hà Nội", phone: "0988888889", isActive: true }
  })
  const branchCG = await prisma.branch.create({
    data: { name: "RosyClass Cầu Giấy", address: "Cầu Giấy, Hà Nội", phone: "0988888890", isActive: true }
  })

  const roomGL1 = await prisma.room.create({ data: { name: "Phòng Cambridge", capacity: 15, branchId: branchGL.id } })
  const roomGL2 = await prisma.room.create({ data: { name: "Phòng Oxford", capacity: 12, branchId: branchGL.id } })
  const roomLB1 = await prisma.room.create({ data: { name: "Phòng Harvard", capacity: 15, branchId: branchLB.id } })
  const roomCG1 = await prisma.room.create({ data: { name: "Phòng IELTS VIP", capacity: 8, branchId: branchCG.id } })

  // 2. Courses
  console.log("Seeding courses...")
  const courseIeltsFound = await prisma.course.create({
    data: {
      name: "IELTS Foundation",
      slug: "ielts-foundation",
      level: "IELTS_FOUNDATION",
      description: "Khóa học nền tảng IELTS xây dựng từ vựng, ngữ pháp lõi và chiến thuật làm bài.",
      totalSessions: 24,
      sessionDurationMinutes: 90,
      tuitionFee: 5000000,
      salePrice: 4500000,
      isPublished: true,
      status: "ACTIVE"
    }
  })

  const courseIelts55 = await prisma.course.create({
    data: {
      name: "IELTS Intermediate 5.5",
      slug: "ielts-5-5",
      level: "IELTS_5_5",
      description: "Khóa học nâng cao kỹ năng giúp đạt mục tiêu IELTS 5.5+.",
      totalSessions: 30,
      sessionDurationMinutes: 90,
      tuitionFee: 6500000,
      salePrice: 6000000,
      isPublished: true,
      status: "ACTIVE"
    }
  })

  const courseIelts65 = await prisma.course.create({
    data: {
      name: "IELTS Advanced 6.5",
      slug: "ielts-6-5",
      level: "IELTS_6_5",
      description: "Khóa luyện chuyên sâu hướng tới target 6.5+.",
      totalSessions: 36,
      sessionDurationMinutes: 120,
      tuitionFee: 8500000,
      salePrice: 8000000,
      isPublished: true,
      status: "ACTIVE"
    }
  })

  const courseComm = await prisma.course.create({
    data: {
      name: "Tiếng Anh Giao Tiếp",
      slug: "tieng-anh-giao-tiep",
      level: "COMMUNICATION",
      description: "Lớp học thực hành giao tiếp phản xạ tự nhiên.",
      totalSessions: 20,
      sessionDurationMinutes: 90,
      tuitionFee: 4000000,
      isPublished: true,
      status: "ACTIVE"
    }
  })

  // 3. Teachers
  console.log("Seeding teachers...")
  const teacherUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "minhanh@rosyclass.edu.vn",
        fullName: "Nguyễn Minh Anh",
        passwordHash: "dummy_hash_for_supabase_auth",
        roleId: teacherRole.id,
        phone: "0977777771"
      }
    }),
    prisma.user.create({
      data: {
        email: "quocbao@rosyclass.edu.vn",
        fullName: "Trần Quốc Bảo",
        passwordHash: "dummy_hash_for_supabase_auth",
        roleId: teacherRole.id,
        phone: "0977777772"
      }
    }),
    prisma.user.create({
      data: {
        email: "lemai@rosyclass.edu.vn",
        fullName: "Lê Thị Mai",
        passwordHash: "dummy_hash_for_supabase_auth",
        roleId: teacherRole.id,
        phone: "0977777773"
      }
    }),
    prisma.user.create({
      data: {
        email: "john@rosyclass.edu.vn",
        fullName: "John Smith",
        passwordHash: "dummy_hash_for_supabase_auth",
        roleId: teacherRole.id,
        phone: "0977777774"
      }
    })
  ])

  const teacherMinhAnh = await prisma.teacher.create({
    data: {
      userId: teacherUsers[0].id,
      fullName: teacherUsers[0].fullName,
      phone: teacherUsers[0].phone!,
      email: teacherUsers[0].email,
      bio: "Giáo viên IELTS dày dặn kinh nghiệm.",
      specialties: "IELTS Writing, Speaking",
      certificates: "IELTS 8.5, TESOL",
      status: "ACTIVE",
      showOnHomepage: true
    }
  })

  const teacherQuocBao = await prisma.teacher.create({
    data: {
      userId: teacherUsers[1].id,
      fullName: teacherUsers[1].fullName,
      phone: teacherUsers[1].phone!,
      email: teacherUsers[1].email,
      bio: "Cựu du học sinh Anh quốc, chuyên trị mất gốc tiếng Anh.",
      specialties: "IELTS Listening, Reading, Grammar",
      certificates: "IELTS 8.0",
      status: "ACTIVE",
      showOnHomepage: true
    }
  })

  const teacherLeMai = await prisma.teacher.create({
    data: {
      userId: teacherUsers[2].id,
      fullName: teacherUsers[2].fullName,
      phone: teacherUsers[2].phone!,
      email: teacherUsers[2].email,
      bio: "Thân thiện, nhiệt huyết, phương pháp dạy sinh động.",
      specialties: "Communication, Kids English",
      certificates: "CELTA",
      status: "ACTIVE",
      showOnHomepage: true
    }
  })

  const teacherJohn = await prisma.teacher.create({
    data: {
      userId: teacherUsers[3].id,
      fullName: teacherUsers[3].fullName,
      phone: teacherUsers[3].phone!,
      email: teacherUsers[3].email,
      bio: "Native English teacher focusing on pronunciation and cultural context.",
      specialties: "Advanced Speaking, Intonation",
      certificates: "TEFL, Master in Linguistics",
      status: "ACTIVE",
      showOnHomepage: true
    }
  })

  // 4. Classes
  console.log("Seeding classes...")
  const classIeltsFoundK1 = await prisma.class.create({
    data: {
      name: "IELTS Foundation K1",
      maxStudents: 15,
      startDate: new Date("2026-05-04T19:30:00.000Z"),
      expectedEndDate: new Date("2026-07-27T21:00:00.000Z"),
      status: "ACTIVE",
      courseId: courseIeltsFound.id,
      teacherId: teacherMinhAnh.id,
      branchId: branchGL.id,
      roomId: roomGL1.id
    }
  })

  const classIelts55K2 = await prisma.class.create({
    data: {
      name: "IELTS 5.5 K2",
      maxStudents: 12,
      startDate: new Date("2026-07-06T18:00:00.000Z"),
      expectedEndDate: new Date("2026-10-19T19:30:00.000Z"),
      status: "UPCOMING",
      courseId: courseIelts55.id,
      teacherId: teacherQuocBao.id,
      branchId: branchGL.id,
      roomId: roomGL2.id
    }
  })

  const classIelts65VIP = await prisma.class.create({
    data: {
      name: "IELTS 6.5 VIP Cầu Giấy",
      maxStudents: 8,
      startDate: new Date("2026-05-09T09:00:00.000Z"),
      expectedEndDate: new Date("2026-09-12T11:00:00.000Z"),
      status: "ACTIVE",
      courseId: courseIelts65.id,
      teacherId: teacherJohn.id,
      branchId: branchCG.id,
      roomId: roomCG1.id
    }
  })

  const classCommK3 = await prisma.class.create({
    data: {
      name: "Giao tiếp Phản xạ K3",
      maxStudents: 15,
      startDate: new Date("2026-03-02T19:30:00.000Z"),
      expectedEndDate: new Date("2026-05-11T21:00:00.000Z"),
      status: "COMPLETED",
      courseId: courseComm.id,
      teacherId: teacherLeMai.id,
      branchId: branchGL.id,
      roomId: roomGL2.id
    }
  })

  // 5. Parents & Students
  console.log("Seeding parents and students...")
  const parentsData = [
    { fullName: "Phạm Minh Tuấn", phone: "0911111111", email: "tuan.pham@example.com" },
    { fullName: "Nguyễn Thu Hà", phone: "0911111112", email: "ha.nguyen@example.com" },
    { fullName: "Lê Hoàng Nam", phone: "0911111113", email: "nam.le@example.com" },
    { fullName: "Vũ Thị Lan", phone: "0911111114", email: "lan.vu@example.com" },
    { fullName: "Đặng Văn Hùng", phone: "0911111115", email: "hung.dang@example.com" },
    { fullName: "Bùi Minh Đức", phone: "0911111116", email: "duc.bui@example.com" }
  ]

  const parents = await Promise.all(
    parentsData.map((p) =>
      prisma.parent.create({
        data: { fullName: p.fullName, phone: p.phone, email: p.email, address: "Hà Nội" }
      })
    )
  )

  const studentsData = [
    // Class IELTS Foundation K1 Enrolled (4 students)
    { code: "HV0001", fullName: "Phạm Minh Khang", phone: "0922222201", status: "ACTIVE", parentId: parents[0].id },
    { code: "HV0002", fullName: "Nguyễn Hà Anh", phone: "0922222202", status: "ACTIVE", parentId: parents[1].id },
    { code: "HV0003", fullName: "Lê Hoàng Bách", phone: "0922222203", status: "ACTIVE", parentId: parents[2].id },
    { code: "HV0004", fullName: "Vũ Phương Linh", phone: "0922222204", status: "ACTIVE", parentId: parents[3].id },

    // Class IELTS 6.5 VIP Enrolled (2 students)
    { code: "HV0005", fullName: "Đặng Khánh Vy", phone: "0922222205", status: "ACTIVE", parentId: parents[4].id },
    { code: "HV0006", fullName: "Bùi Minh Tuấn", phone: "0922222206", status: "ACTIVE", parentId: parents[5].id },

    // Completed Class Giao tiếp (2 students)
    { code: "HV0007", fullName: "Nguyễn Hải Đăng", phone: "0922222207", status: "ACTIVE", parentId: parents[1].id },
    { code: "HV0008", fullName: "Phạm Thúy Hằng", phone: "0922222208", status: "ACTIVE", parentId: parents[0].id },

    // Waiting class students (5 students)
    { code: "HV0009", fullName: "Trần Minh Quân", phone: "0922222209", status: "WAITING_CLASS", parentId: parents[0].id },
    { code: "HV0010", fullName: "Lê Mỹ Duyên", phone: "0922222210", status: "WAITING_CLASS", parentId: parents[2].id },
    { code: "HV0011", fullName: "Hoàng Gia Bảo", phone: "0922222211", status: "WAITING_CLASS", parentId: parents[3].id },
    { code: "HV0012", fullName: "Trịnh Hoài Nam", phone: "0922222212", status: "WAITING_CLASS", parentId: parents[4].id },
    { code: "HV0013", fullName: "Phan Thanh Trúc", phone: "0922222213", status: "WAITING_CLASS", parentId: parents[5].id },

    // Paused/Reserved (2 students)
    { code: "HV0014", fullName: "Nguyễn Lâm Oanh", phone: "0922222214", status: "RESERVED", parentId: parents[1].id },
    { code: "HV0015", fullName: "Ngô Quốc Việt", phone: "0922222215", status: "DROPPED", parentId: parents[3].id }
  ]

  const students = await Promise.all(
    studentsData.map((s) =>
      prisma.student.create({
        data: {
          code: s.code,
          fullName: s.fullName,
          phone: s.phone,
          status: s.status as any,
          parentId: s.parentId,
          dateOfBirth: new Date("2010-05-15T00:00:00.000Z"),
          gender: "Male",
          joinedAt: new Date()
        }
      })
    )
  )

  // 6. Enroll Students in Classes (ClassStudent)
  console.log("Enrolling students in classes...")
  const classEnrollments = [
    // IELTS Foundation K1
    { classId: classIeltsFoundK1.id, studentId: students[0].id, status: "ACTIVE" },
    { classId: classIeltsFoundK1.id, studentId: students[1].id, status: "ACTIVE" },
    { classId: classIeltsFoundK1.id, studentId: students[2].id, status: "ACTIVE" },
    { classId: classIeltsFoundK1.id, studentId: students[3].id, status: "ACTIVE" },

    // IELTS 6.5 VIP
    { classId: classIelts65VIP.id, studentId: students[4].id, status: "ACTIVE" },
    { classId: classIelts65VIP.id, studentId: students[5].id, status: "ACTIVE" },

    // Giao tiếp Phản xạ K3 (Completed)
    { classId: classCommK3.id, studentId: students[6].id, status: "ACTIVE" },
    { classId: classCommK3.id, studentId: students[7].id, status: "ACTIVE" }
  ]

  for (const ce of classEnrollments) {
    await prisma.classStudent.create({
      data: { classId: ce.classId, studentId: ce.studentId, status: ce.status as any }
    })
  }

  // 7. Class Schedules
  console.log("Seeding schedules and sessions...")
  // IELTS Foundation K1: Thứ Hai và Thứ Tư, 19:30 - 21:00
  await prisma.classSchedule.createMany({
    data: [
      { classId: classIeltsFoundK1.id, dayOfWeek: 1, startTime: "19:30", endTime: "21:00", roomId: roomGL1.id, teacherId: teacherMinhAnh.id },
      { classId: classIeltsFoundK1.id, dayOfWeek: 3, startTime: "19:30", endTime: "21:00", roomId: roomGL1.id, teacherId: teacherMinhAnh.id }
    ]
  })

  // IELTS 6.5 VIP: Thứ Bảy, 09:00 - 11:00
  await prisma.classSchedule.create({
    data: { classId: classIelts65VIP.id, dayOfWeek: 6, startTime: "09:00", endTime: "11:00", roomId: roomCG1.id, teacherId: teacherJohn.id }
  })

  // 8. Generate Class Sessions & Attendances for IELTS Foundation K1
  // Total 24 sessions. Let's create them sequentially starting from May 4, 2026.
  const ieltsK1Sessions: Date[] = []
  let currentDate = new Date("2026-05-04T12:00:00.000Z") // Monday
  while (ieltsK1Sessions.length < 24) {
    const day = currentDate.getUTCDay()
    if (day === 1 || day === 3) {
      ieltsK1Sessions.push(new Date(currentDate))
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  const generatedSessions = []
  for (let i = 0; i < ieltsK1Sessions.length; i++) {
    const isCompleted = i < 10 // Mark first 10 sessions as completed
    const session = await prisma.classSession.create({
      data: {
        classId: classIeltsFoundK1.id,
        sessionDate: ieltsK1Sessions[i],
        startTime: "19:30",
        endTime: "21:00",
        status: isCompleted ? "COMPLETED" : "SCHEDULED",
        topic: `Bài học số ${i + 1}: Grammar & Vocabulary Basics Part ${i + 1}`,
        notes: isCompleted ? `Đã hoàn thành nội dung bài ${i + 1}. Học viên tương tác tốt.` : null,
        roomId: roomGL1.id,
        teacherId: teacherMinhAnh.id
      }
    })
    generatedSessions.push(session)

    // Generate attendances for completed sessions
    if (isCompleted) {
      const attendanceStatuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT_WITH_PERMISSION"]
      for (let sIdx = 0; sIdx < 4; sIdx++) {
        // Rotate status to create realistic data (some present, some absent)
        const status = attendanceStatuses[(sIdx + i) % 4]
        await prisma.attendance.create({
          data: {
            sessionId: session.id,
            studentId: students[sIdx].id,
            status: status as any,
            note: status === "ABSENT_WITH_PERMISSION" ? "Phụ huynh xin nghỉ qua zalo" : null
          }
        })
      }
    }
  }

  // 9. Seeding Scores for active students
  console.log("Seeding student academic scores...")
  const activeK1Students = students.slice(0, 4)
  for (const student of activeK1Students) {
    await prisma.score.create({
      data: {
        type: "QUIZ",
        value: 8.5,
        maxValue: 10,
        note: "Bài test từ vựng số 1",
        date: new Date("2026-05-18T12:00:00.000Z"),
        studentId: student.id,
        classId: classIeltsFoundK1.id,
        sessionId: generatedSessions[3].id,
        createdById: admin.id
      }
    })
    await prisma.score.create({
      data: {
        type: "MIDTERM",
        value: 7.5,
        maxValue: 10,
        note: "Bài kiểm tra giữa kỳ 4 kỹ năng",
        date: new Date("2026-06-08T12:00:00.000Z"),
        studentId: student.id,
        classId: classIeltsFoundK1.id,
        sessionId: generatedSessions[9].id,
        createdById: admin.id
      }
    })
  }

  // 10. Seeding Payments (Correct VietQR content structure)
  console.log("Seeding payments and receipts...")

  const generateTransferContent = (code: string | null, name: string, receiptCode: string) => {
    if (code) {
      return `ROSY ${code} ${removeDiacritics(name)}`
    }
    return `ROSY ${receiptCode}`
  }

  const paymentsDataToSeed = [
    // Student 1: Paid in full for IELTS Foundation
    {
      receiptCode: "BL-20260501",
      totalAmount: 5000000,
      paidAmount: 5000000,
      remainingAmount: 0,
      paymentMethod: "BANK_TRANSFER",
      paymentDate: new Date("2026-05-02T10:00:00.000Z"),
      dueDate: new Date("2026-05-04T00:00:00.000Z"),
      status: "PAID",
      student: students[0],
      classId: classIeltsFoundK1.id,
      courseId: courseIeltsFound.id,
      note: "Học phí trọn khóa"
    },
    // Student 2: Paid partially
    {
      receiptCode: "BL-20260502",
      totalAmount: 5000000,
      paidAmount: 3000000,
      remainingAmount: 2000000,
      paymentMethod: "BANK_TRANSFER",
      paymentDate: new Date("2026-05-03T14:30:00.000Z"),
      dueDate: new Date("2026-05-04T00:00:00.000Z"),
      status: "PARTIAL",
      student: students[1],
      classId: classIeltsFoundK1.id,
      courseId: courseIeltsFound.id,
      note: "Đóng trước đợt 1"
    },
    // Student 3: Unpaid
    {
      receiptCode: "BL-20260503",
      totalAmount: 5000000,
      paidAmount: 0,
      remainingAmount: 5000000,
      paymentMethod: "BANK_TRANSFER",
      paymentDate: null,
      dueDate: new Date("2026-05-04T00:00:00.000Z"),
      status: "UNPAID",
      student: students[2],
      classId: classIeltsFoundK1.id,
      courseId: courseIeltsFound.id,
      note: "Chờ chuyển khoản"
    },
    // Student 5: Enrolled in IELTS 6.5 (Sale Price) - Paid Cash
    {
      receiptCode: "BL-20260504",
      totalAmount: 8000000,
      paidAmount: 8000000,
      remainingAmount: 0,
      paymentMethod: "CASH",
      paymentDate: new Date("2026-05-08T09:00:00.000Z"),
      dueDate: new Date("2026-05-09T00:00:00.000Z"),
      status: "PAID",
      student: students[4],
      classId: classIelts65VIP.id,
      courseId: courseIelts65.id,
      note: "Nộp tiền mặt tại quầy"
    },
    // Student 9 (Waiting class): Paid for future course
    {
      receiptCode: "BL-20260601",
      totalAmount: 4500000,
      paidAmount: 4500000,
      remainingAmount: 0,
      paymentMethod: "BANK_TRANSFER",
      paymentDate: new Date("2026-06-10T11:20:00.000Z"),
      dueDate: new Date("2026-06-15T00:00:00.000Z"),
      status: "PAID",
      student: students[8],
      classId: null,
      courseId: courseIeltsFound.id,
      note: "Đặt chỗ trước lớp khai giảng sau"
    }
  ]

  for (const pay of paymentsDataToSeed) {
    const transferContent = generateTransferContent(pay.student.code, pay.student.fullName, pay.receiptCode)
    const qrPayload = `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${pay.totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=TRUNG%20TAM%20ROSYCLASS`

    const payment = await prisma.payment.create({
      data: {
        receiptCode: pay.receiptCode,
        totalAmount: pay.totalAmount,
        paidAmount: pay.paidAmount,
        remainingAmount: pay.remainingAmount,
        paymentMethod: pay.paymentMethod as any,
        paymentDate: pay.paymentDate,
        dueDate: pay.dueDate,
        status: pay.status as any,
        qrPayload,
        bankName: pay.paymentMethod === "BANK_TRANSFER" ? "MB Bank" : null,
        bankAccountName: pay.paymentMethod === "BANK_TRANSFER" ? "TRUNG TAM ROSYCLASS" : null,
        bankAccountNo: pay.paymentMethod === "BANK_TRANSFER" ? "0988888888" : null,
        note: pay.note,
        studentId: pay.student.id,
        classId: pay.classId,
        courseId: pay.courseId,
        createdById: admin.id
      }
    })

    // Add line items
    await prisma.paymentLineItem.create({
      data: {
        paymentId: payment.id,
        description: `Học phí khóa ${pay.courseId === courseIeltsFound.id ? "IELTS Foundation" : "IELTS 6.5"}`,
        category: "TUITION",
        quantity: 1,
        unitAmount: pay.totalAmount,
        totalAmount: pay.totalAmount
      }
    })
  }

  // 11. Seeding Leads & Placement Tests
  console.log("Seeding CRM leads and test book entries...")
  const leadSources = ["Facebook", "Zalo", "Website", "Hotline", "Giới thiệu"]
  const leadsData = [
    { fullName: "Nguyễn Khánh Ngọc", phone: "0966666001", status: "NEW" },
    { fullName: "Lê Minh Dương", phone: "0966666002", status: "CONTACTED" },
    { fullName: "Phạm Thùy Chi", phone: "0966666003", status: "CONSULTED" },
    { fullName: "Vũ Gia Huy", phone: "0966666004", status: "PLACEMENT_TEST_BOOKED" },
    { fullName: "Trần Bảo Nam", phone: "0966666005", status: "TESTED" },
    { fullName: "Đỗ Mỹ Linh", phone: "0966666006", status: "WAITING_FOR_PAYMENT" },
    { fullName: "Phan Hoàng Long", phone: "0966666007", status: "LOST" },
    { fullName: "Bùi Mỹ Lệ", phone: "0966666008", status: "NEW" }
  ]

  for (let i = 0; i < leadsData.length; i++) {
    const l = leadsData[i]
    const lead = await prisma.lead.create({
      data: {
        fullName: l.fullName,
        phone: l.phone,
        email: `${removeDiacritics(l.fullName).toLowerCase().replace(/\s/g, "")}@example.com`,
        age: 15,
        parentName: "Phụ huynh " + l.fullName,
        parentPhone: l.phone,
        source: leadSources[i % leadSources.length],
        status: l.status as any,
        learningGoal: "Cần đạt IELTS 6.0 để xét tuyển thẳng đại học.",
        currentLevel: "Starter",
        interestedCourseId: courseIeltsFound.id,
        assignedToId: consultantUser.id,
        notes: "Quan tâm đến lịch học các buổi tối trong tuần."
      }
    })

    // Add lead note
    await prisma.leadNote.create({
      data: {
        leadId: lead.id,
        content: `Tư vấn viên ${consultantUser.fullName} đã liên hệ và cập nhật trạng thái: ${l.status}`,
        createdById: consultantUser.id
      }
    })

    // If test booked or tested, generate placement test
    if (l.status === "PLACEMENT_TEST_BOOKED" || l.status === "TESTED") {
      await prisma.placementTest.create({
        data: {
          testDate: new Date(),
          listeningScore: l.status === "TESTED" ? 6.5 : null,
          readingScore: l.status === "TESTED" ? 6.0 : null,
          writingScore: l.status === "TESTED" ? 5.5 : null,
          speakingScore: l.status === "TESTED" ? 6.0 : null,
          totalScore: l.status === "TESTED" ? 6.0 : null,
          levelResult: l.status === "TESTED" ? "B1/B2" : null,
          teacherComment: l.status === "TESTED" ? "Kỹ năng nói phản xạ tốt, vốn từ vựng nền ổn. Cần cải thiện ngữ pháp viết." : null,
          leadId: lead.id,
          suggestedCourseId: courseIeltsFound.id,
          suggestedClassId: classIeltsFoundK1.id
        }
      })
    }
  }

  // 12. Seeding Placement Questions
  console.log("Seeding placement questions...")
  const placementQuestions = [
    {
      type: "MULTIPLE_CHOICE",
      question: "Which of the following is correct: She _____ to school by bus every day.",
      options: ["go", "goes", "going", "went"],
      correctIndex: 1,
      order: 1,
      level: "STARTER"
    },
    {
      type: "MULTIPLE_CHOICE",
      question: "If I _____ you, I would take that opportunity.",
      options: ["am", "was", "were", "be"],
      correctIndex: 2,
      order: 2,
      level: "A2"
    },
    {
      type: "MULTIPLE_CHOICE",
      question: "Identify the synonym of 'Enormous':",
      options: ["Miniature", "Mammoth", "Microscopic", "Moderate"],
      correctIndex: 1,
      order: 3,
      level: "B1"
    }
  ]

  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({
      data: {
        type: q.type,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        order: q.order,
        level: q.level as any,
        isPublished: true
      }
    })
  }

  // 13. Website CMS & Settings
  console.log("Seeding CMS settings, testimonials and FAQ...")
  await prisma.page.upsert({
    where: { slug: SITE_SETTINGS_SLUG },
    update: {},
    create: {
      slug: SITE_SETTINGS_SLUG,
      title: "Cài đặt website",
      content: JSON.stringify(DEFAULT_SITE_SETTINGS),
      status: "ACTIVE"
    }
  })

  await prisma.banner.create({
    data: {
      title: "RosyClass English Center",
      subtitle: "Lớp học quy mô nhỏ, cam kết sát sao và đồng hành tiến bộ vượt bậc.",
      image: "/english-center-hero.png",
      buttonText: "Đăng ký học thử ngay",
      buttonUrl: "/dang-ky",
      position: 1,
      isActive: true
    }
  })

  const faqs = [
    { question: "Học phí tại RosyClass được tính thế nào?", answer: "Học phí được tính trọn gói theo khóa học, đã bao gồm giáo trình và bài kiểm tra định kỳ.", position: 1 },
    { question: "Quy mô sĩ số lớp học tối đa là bao nhiêu?", answer: "Các lớp thông thường tối đa 12-15 học viên, lớp VIP tối đa 8 học viên để đảm bảo chất lượng giảng dạy tốt nhất.", position: 2 },
    { question: "Tôi có được đổi buổi học nếu bận đột xuất?", answer: "Học viên được hỗ trợ sắp xếp học bù ở các lớp song song cùng trình độ (nếu có) khi xin phép trước ít nhất 1 ngày.", position: 3 }
  ]

  for (const f of faqs) {
    await prisma.faq.create({ data: { question: f.question, answer: f.answer, position: f.position, status: "ACTIVE" } })
  }

  const testimonials = [
    { authorName: "Chị Nguyễn Thu Thủy", authorTitle: "Phụ huynh bạn Hải Anh (HV0002)", content: "Tôi rất yên tâm khi gửi con học tại RosyClass. Giáo viên rất tận tình gửi báo cáo học tập chi tiết sau từng buổi.", rating: 5, isPublished: true },
    { authorName: "Bạn Lê Hoàng Bách", authorTitle: "Học viên lớp IELTS Foundation", content: "Từ một người mất gốc, sau khóa học mình đã tự tin viết bài luận ngắn và cải thiện phát âm đáng kể.", rating: 5, isPublished: true }
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }

  await prisma.activityLog.create({
    data: {
      action: "seed.rich_mock_data",
      entityType: "system",
      details: "Seeded rich academic, financial and CRM mock datasets for end-to-end testing.",
      userId: admin.id
    }
  })

  console.log("Seeding completed successfully!")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
