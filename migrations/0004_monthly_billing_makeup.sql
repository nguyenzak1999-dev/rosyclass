-- Học phí thu theo tháng: đơn giá/buổi (khoá học, lớp), lớp 1-1, buổi giáo viên nước ngoài có phụ thu,
-- phiếu thu theo tháng (billingMonth + ảnh chụp số liệu đối chiếu) và lịch kèm bù 30 phút cho buổi nghỉ.
-- Viết tay từ `prisma migrate diff`: Prisma muốn dựng lại bảng Class và ClassSession (DROP TABLE) để thêm cột
-- BOOLEAN NOT NULL DEFAULT, việc đó trên D1 có thể kéo theo ON DELETE CASCADE xoá điểm danh, điểm số, bài tập…
-- SQLite thêm được cột NOT NULL có DEFAULT hằng số bằng ALTER TABLE, nên ở đây chỉ dùng ADD COLUMN / CREATE.

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "sessionFee" REAL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN "sessionFee" REAL;
ALTER TABLE "Class" ADD COLUMN "isOneOnOne" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN "isForeignTeacher" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClassSession" ADD COLUMN "surcharge" REAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "billingMonth" TEXT;
ALTER TABLE "Payment" ADD COLUMN "billingSummary" TEXT;

-- CreateTable
CREATE TABLE "MakeUpLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduledDate" DATETIME NOT NULL,
    "startTime" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "teacherId" TEXT,
    "creditedPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MakeUpLesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MakeUpLesson_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MakeUpLesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MakeUpLesson_creditedPaymentId_fkey" FOREIGN KEY ("creditedPaymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MakeUpLesson_studentId_status_idx" ON "MakeUpLesson"("studentId", "status");

-- CreateIndex
CREATE INDEX "MakeUpLesson_scheduledDate_idx" ON "MakeUpLesson"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "MakeUpLesson_sessionId_studentId_key" ON "MakeUpLesson"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Payment_studentId_billingMonth_idx" ON "Payment"("studentId", "billingMonth");
