-- Migration: training_module_init
-- Phase 1 của module "ĐÀO TẠO & LỊCH HỌC"
-- Thêm model Score, ClassNote, enum ScoreType; relations cho PlacementTest;
-- unique + index cho ClassSession.

-- 1. Tạo enum ScoreType
CREATE TYPE "ScoreType" AS ENUM ('QUIZ', 'MIDTERM', 'FINAL', 'SPEAKING', 'WRITING', 'LISTENING', 'READING', 'OTHER');

-- 2. ClassSession: unique constraint + indexes
ALTER TABLE "ClassSession"
  ADD CONSTRAINT "ClassSession_classId_sessionDate_startTime_key" UNIQUE ("classId", "sessionDate", "startTime");

CREATE INDEX "ClassSession_sessionDate_idx" ON "ClassSession"("sessionDate");
CREATE INDEX "ClassSession_classId_sessionDate_idx" ON "ClassSession"("classId", "sessionDate");

-- 3. PlacementTest: thêm foreign key columns (relations thật)
ALTER TABLE "PlacementTest"
  ADD COLUMN "suggestedCourseId_new" TEXT,
  ADD COLUMN "suggestedClassId_new" TEXT;

-- Backfill từ String cũ (nếu có)
UPDATE "PlacementTest" SET "suggestedCourseId_new" = "suggestedCourseId" WHERE "suggestedCourseId" IS NOT NULL;
UPDATE "PlacementTest" SET "suggestedClassId_new" = "suggestedClassId" WHERE "suggestedClassId" IS NOT NULL;

-- Tạo FK mới
ALTER TABLE "PlacementTest"
  ADD CONSTRAINT "PlacementTest_suggestedCourseId_new_fkey" FOREIGN KEY ("suggestedCourseId_new") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PlacementTest_suggestedClassId_new_fkey" FOREIGN KEY ("suggestedClassId_new") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Xoá column String cũ, đổi tên column mới
ALTER TABLE "PlacementTest" DROP COLUMN "suggestedCourseId", DROP COLUMN "suggestedClassId";
ALTER TABLE "PlacementTest" RENAME COLUMN "suggestedCourseId_new" TO "suggestedCourseId";
ALTER TABLE "PlacementTest" RENAME COLUMN "suggestedClassId_new" TO "suggestedClassId";

-- 4. Tạo bảng Score
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "type" "ScoreType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- Indexes cho Score
CREATE INDEX "Score_classId_date_idx" ON "Score"("classId", "date");
CREATE INDEX "Score_studentId_classId_idx" ON "Score"("studentId", "classId");

-- FKs cho Score
ALTER TABLE "Score" ADD CONSTRAINT "Score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Tạo bảng ClassNote
CREATE TABLE "ClassNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "ClassNote_pkey" PRIMARY KEY ("id")
);

-- Index cho ClassNote
CREATE INDEX "ClassNote_classId_createdAt_idx" ON "ClassNote"("classId", "createdAt");

-- FKs cho ClassNote
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
