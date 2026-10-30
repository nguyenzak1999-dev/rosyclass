// Nạp một lớp mẫu đầy đủ dữ liệu để xem thử trang lớp, điểm danh và phiếu thu: 12 bé, 6 buổi đã học có điểm danh,
// điểm và sao nhận xét, cộng 2 buổi sắp tới. Khóa học tạo ở trạng thái ẩn nên không hiện ra web.
// Chạy lại vẫn an toàn: đã có lớp cùng tên thì bỏ qua.
//
//   npm run db:seed-demo-class                 # D1 remote (theo phiên `cf auth login`)
//   D1_LOCAL=1 npm run db:seed-demo-class      # D1 giả lập khi `npm run dev` đang chạy
import { randomUUID } from "node:crypto"
import { nowIso, queryRows, runSql, sqlString } from "./lib/d1"

const CLASS_NAME = "Lớp 1A Sunflower (mẫu)"
const COURSE_SLUG = "lop-1-mau-3d"
const CURRICULUM_NAME = "Tiếng Anh lớp 1 (mẫu)"

const STUDENTS = [
  "Nguyễn Minh Anh",
  "Trần Gia Bảo",
  "Lê Khánh Chi",
  "Phạm Đức Duy",
  "Hoàng Bảo Hân",
  "Vũ Tuấn Khang",
  "Đặng Ngọc Linh",
  "Bùi Hải Nam",
  "Đỗ Phương Thảo",
  "Ngô Quang Vinh",
  "Dương Thu Uyên",
  "Lý Minh Khôi",
]

const PRAISES = ["Phát âm tốt", "Hăng hái phát biểu", "Ngoan, tập trung", "Giúp đỡ bạn", "Hoàn thành bài"]
const MOODS = ["😄", "🙂", "😐", "😴"]

// Điểm danh từng buổi (cột = bé theo thứ tự trên). Bé cuối mới vào lớp nên chưa có buổi nào.
// P có mặt · L đi muộn · M học bù · A vắng có phép · X vắng không phép · - chưa vào lớp
const ATTENDANCE = [
  "PPPPPPPPPPP-",
  "PPLPPPPAPPP-",
  "PPPPXPPPPLP-",
  "PLPPPPMPPPP-",
  "PPPPPAPPLPP-",
  "PPLPAPMPPXP-",
]
const STATUS: Record<string, string> = {
  P: "PRESENT",
  L: "LATE",
  M: "MAKE_UP",
  A: "ABSENT_WITH_PERMISSION",
  X: "ABSENT_WITHOUT_PERMISSION",
}

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000

/** 00:00 giờ Việt Nam của ngày cách hôm nay `offsetDays` ngày, cùng định dạng adapter-d1 ghi DateTime */
function vietnamMidnight(offsetDays: number) {
  const local = new Date(Date.now() + VIETNAM_OFFSET_MS)
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + offsetDays) - VIETNAM_OFFSET_MS
  return new Date(midnight).toISOString().replace("Z", "+00:00")
}

/** Số giả ngẫu nhiên ổn định theo hạt giống, để mỗi lần seed ra cùng một lớp */
function seeded(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function findId(sql: string) {
  return queryRows<{ id: string }>(sql)[0]?.id ?? null
}

function main() {
  if (findId(`SELECT id FROM "Class" WHERE "name" = ${sqlString(CLASS_NAME)} LIMIT 1`)) {
    console.log(`Đã có lớp "${CLASS_NAME}", bỏ qua.`)
    return
  }

  const now = nowIso()
  const sql: string[] = []

  const branchId = findId(`SELECT id FROM "Branch" ORDER BY "createdAt" LIMIT 1`) ?? randomUUID()
  if (!findId(`SELECT id FROM "Branch" WHERE id = ${sqlString(branchId)}`)) {
    sql.push(`INSERT INTO "Branch" ("id","name","address","isActive","createdAt","updatedAt") VALUES (${sqlString(branchId)},'Cơ sở chính',NULL,1,'${now}','${now}')`)
  }

  const roomId = randomUUID()
  sql.push(`INSERT INTO "Room" ("id","name","capacity","isActive","branchId","createdAt","updatedAt") VALUES (${sqlString(roomId)},'Phòng Sunflower',16,1,${sqlString(branchId)},'${now}','${now}')`)

  const teacherId = randomUUID()
  sql.push(`INSERT INTO "Teacher" ("id","fullName","phone","bio","specialties","status","showOnHomepage","createdAt","updatedAt") VALUES (${sqlString(teacherId)},'Cô Mai Linh (mẫu)','0900000000','Giáo viên mẫu cho lớp 3D','Phonics','ACTIVE',0,'${now}','${now}')`)

  const courseId = findId(`SELECT id FROM "Course" WHERE "slug" = ${sqlString(COURSE_SLUG)}`) ?? randomUUID()
  if (!findId(`SELECT id FROM "Course" WHERE id = ${sqlString(courseId)}`)) {
    sql.push(`INSERT INTO "Course" ("id","name","slug","level","description","totalSessions","sessionDurationMinutes","tuitionFee","isPublished","status","createdAt","updatedAt") VALUES (${sqlString(courseId)},'Tiếng Anh lớp 1 (lớp mẫu)',${sqlString(COURSE_SLUG)},'STARTER','Khóa học mẫu cho lớp 3D, không hiển thị trên web',24,60,0,0,'ACTIVE','${now}','${now}')`)
  }

  // Gắn chương trình lớp 1 mẫu nếu đã seed (npm run db:seed-curriculum)
  const curriculumId = findId(`SELECT id FROM "Curriculum" WHERE "name" = ${sqlString(CURRICULUM_NAME)} LIMIT 1`)
  const lessonIds = curriculumId
    ? queryRows<{ id: string }>(
        `SELECT l.id FROM "Lesson" l JOIN "CurriculumUnit" u ON u.id = l."unitId" WHERE u."curriculumId" = ${sqlString(curriculumId)} ORDER BY u."order", l."order" LIMIT 8`
      ).map((row) => row.id)
    : []

  const classId = randomUUID()
  sql.push(`INSERT INTO "Class" ("id","name","maxStudents","startDate","status","courseId","teacherId","branchId","roomId","curriculumId","createdAt","updatedAt") VALUES (${sqlString(classId)},${sqlString(CLASS_NAME)},16,'${vietnamMidnight(-21)}','ACTIVE',${sqlString(courseId)},${sqlString(teacherId)},${sqlString(branchId)},${sqlString(roomId)},${sqlString(curriculumId)},'${now}','${now}')`)

  const studentIds = STUDENTS.map(() => randomUUID())
  STUDENTS.forEach((fullName, index) => {
    const id = studentIds[index]
    const code = `DEMO3D${String(index + 1).padStart(2, "0")}`
    sql.push(`INSERT INTO "Student" ("id","code","fullName","currentLevel","status","source","joinedAt","createdAt","updatedAt") VALUES (${sqlString(id)},'${code}',${sqlString(fullName)},'STARTER','ACTIVE','Seed lớp 3D','${now}','${now}','${now}')`)
    sql.push(`INSERT INTO "ClassStudent" ("classId","studentId","status","joinedAt") VALUES (${sqlString(classId)},${sqlString(id)},'ACTIVE','${now}')`)
  })

  // 6 buổi đã học (thứ 3 và thứ 5 lùi dần về trước) + 2 buổi sắp tới
  const offsets = [-19, -17, -12, -10, -5, -3, 2, 4]
  offsets.forEach((offset, sessionIndex) => {
    const sessionId = randomUUID()
    const done = offset < 0
    sql.push(`INSERT INTO "ClassSession" ("id","sessionDate","startTime","endTime","status","topic","classId","roomId","teacherId","lessonId","createdAt","updatedAt") VALUES (${sqlString(sessionId)},'${vietnamMidnight(offset)}','17:30','18:30','${done ? "COMPLETED" : "SCHEDULED"}',${sqlString(lessonIds[sessionIndex] ? null : `Buổi ${sessionIndex + 1}`)},${sqlString(classId)},${sqlString(roomId)},${sqlString(teacherId)},${sqlString(lessonIds[sessionIndex] ?? null)},'${now}','${now}')`)
    if (!done) return

    const row = ATTENDANCE[sessionIndex]
    studentIds.forEach((studentId, studentIndex) => {
      const mark = row[studentIndex]
      if (mark === "-") return
      sql.push(`INSERT INTO "Attendance" ("id","status","sessionId","studentId","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},'${STATUS[mark]}',${sqlString(sessionId)},${sqlString(studentId)},'${now}','${now}')`)
      if (mark === "A" || mark === "X") return

      const roll = seeded(sessionIndex * 31 + studentIndex * 7 + 1)
      const stars = 2 + Math.round(roll * 3)
      const praises = PRAISES.filter((_, i) => seeded(sessionIndex * 13 + studentIndex * 5 + i) > 0.6)
      sql.push(`INSERT INTO "SessionFeedback" ("id","stars","praises","mood","sessionId","studentId","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${stars},${sqlString(JSON.stringify(praises))},${sqlString(MOODS[Math.floor(roll * MOODS.length)])},${sqlString(sessionId)},${sqlString(studentId)},'${now}','${now}')`)

      // Buổi 3 kiểm tra nhanh từ vựng, buổi 6 kiểm tra nói
      if (sessionIndex === 2 || sessionIndex === 5) {
        const value = Math.round((5 + roll * 5) * 2) / 2
        sql.push(`INSERT INTO "Score" ("id","type","value","maxValue","date","studentId","classId","sessionId","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},'${sessionIndex === 2 ? "QUIZ" : "SPEAKING"}',${value},10,'${vietnamMidnight(offset)}',${sqlString(studentId)},${sqlString(classId)},${sqlString(sessionId)},'${now}','${now}')`)
      }
    })
  })

  runSql(sql.join(";\n"))
  console.log(`Đã tạo lớp "${CLASS_NAME}" (${STUDENTS.length} bé, ${offsets.length} buổi). Mở: /admin/classes/${classId}`)
}

main()
