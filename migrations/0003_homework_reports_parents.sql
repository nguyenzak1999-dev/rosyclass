-- Phân hệ lớp 1 (giai đoạn 3–4): bài tập về nhà, đánh giá kỹ năng, báo cáo tiến bộ, link đăng nhập cổng phụ huynh.
-- Sinh bằng `prisma migrate diff` (từ schema của commit trước). Chỉ có CREATE TABLE / CREATE INDEX:
-- không bảng cũ nào bị dựng lại, nên không có rủi ro DROP TABLE kéo theo ON DELETE CASCADE trên D1.
-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'OTHER',
    "dueDate" DATETIME,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT,
    "lessonId" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Homework_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Homework_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Homework_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submittedBy" TEXT NOT NULL DEFAULT 'PARENT',
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "parentNote" TEXT,
    "sticker" TEXT,
    "teacherComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "reviewedAt" DATETIME,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HomeworkSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skill" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "note" TEXT,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "assessedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SkillAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillAssessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillAssessment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillAssessment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "teacherComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressReport_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParentAccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "lastUsedAt" DATETIME,
    "parentId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParentAccessToken_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ParentAccessToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Homework_classId_createdAt_idx" ON "Homework"("classId", "createdAt");

-- CreateIndex
CREATE INDEX "Homework_sessionId_idx" ON "Homework"("sessionId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_status_createdAt_idx" ON "HomeworkSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_studentId_idx" ON "HomeworkSubmission"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_homeworkId_studentId_key" ON "HomeworkSubmission"("homeworkId", "studentId");

-- CreateIndex
CREATE INDEX "SkillAssessment_classId_unitId_idx" ON "SkillAssessment"("classId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAssessment_studentId_unitId_skill_key" ON "SkillAssessment"("studentId", "unitId", "skill");

-- CreateIndex
CREATE INDEX "ProgressReport_classId_periodStart_idx" ON "ProgressReport"("classId", "periodStart");

-- CreateIndex
CREATE INDEX "ProgressReport_studentId_status_idx" ON "ProgressReport"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ParentAccessToken_tokenHash_key" ON "ParentAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentAccessToken_parentId_idx" ON "ParentAccessToken"("parentId");

