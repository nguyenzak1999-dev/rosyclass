-- Phân hệ Tiếng Anh lớp 1: chương trình học (Unit → Bài), gắn bài cho buổi học, sao & nhận xét từng bé.
-- Sinh bằng `prisma migrate diff` rồi sửa tay phần thêm khoá ngoại (xem ghi chú bên dưới).
-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gradeLabel" TEXT NOT NULL,
    "description" TEXT,
    "sourceBook" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CurriculumUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "objectives" TEXT,
    "vocabulary" TEXT NOT NULL DEFAULT '[]',
    "sentencePatterns" TEXT NOT NULL DEFAULT '[]',
    "phonics" TEXT,
    "songUrl" TEXT,
    "curriculumId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumUnit_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "objectives" TEXT,
    "activities" TEXT,
    "materials" TEXT,
    "mediaUrl" TEXT,
    "homework" TEXT,
    "unitId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "praises" TEXT NOT NULL DEFAULT '[]',
    "mood" TEXT,
    "comment" TEXT,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionFeedback_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AddForeignKeyColumns
-- Prisma sinh ra kiểu "tạo bảng mới → INSERT SELECT → DROP bảng cũ" để thêm khoá ngoại.
-- Trên D1 cách đó làm MẤT DỮ LIỆU: D1 luôn bật foreign_keys (bỏ qua PRAGMA foreign_keys=OFF),
-- nên DROP TABLE "Class" kéo theo ON DELETE CASCADE xoá sạch ClassStudent, ClassSchedule,
-- ClassSession, Attendance, Score, ClassNote... (đã kiểm chứng trên D1 local).
-- SQLite cho phép ADD COLUMN có REFERENCES khi cột nullable, mặc định NULL: không đụng tới dữ liệu cũ.
ALTER TABLE "Class" ADD COLUMN "curriculumId" TEXT REFERENCES "Curriculum" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClassSession" ADD COLUMN "lessonId" TEXT REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Class_curriculumId_idx" ON "Class"("curriculumId");

-- CreateIndex
CREATE INDEX "ClassSession_lessonId_idx" ON "ClassSession"("lessonId");

-- CreateIndex
CREATE INDEX "CurriculumUnit_curriculumId_order_idx" ON "CurriculumUnit"("curriculumId", "order");

-- CreateIndex
CREATE INDEX "Lesson_unitId_order_idx" ON "Lesson"("unitId", "order");

-- CreateIndex
CREATE INDEX "SessionFeedback_studentId_idx" ON "SessionFeedback"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionFeedback_sessionId_studentId_key" ON "SessionFeedback"("sessionId", "studentId");
