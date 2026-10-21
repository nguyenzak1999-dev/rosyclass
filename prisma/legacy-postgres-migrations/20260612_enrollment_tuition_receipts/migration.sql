-- Migration: enrollment_tuition_receipts
-- Adds tuition plans, enrollments, receipt line items, and payment receipt metadata.

CREATE TYPE "TeacherType" AS ENUM ('LOCAL', 'FOREIGN', 'ANY');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'TRANSFERRED', 'CANCELLED');
CREATE TYPE "PaymentCategory" AS ENUM ('TUITION', 'MATERIAL', 'TEST', 'MAKE_UP', 'DISCOUNT', 'OTHER');

CREATE TABLE "TuitionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sessionCount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "teacherType" "TeacherType" NOT NULL DEFAULT 'ANY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuitionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasedSessions" INTEGER NOT NULL,
    "usedSessions" INTEGER NOT NULL DEFAULT 0,
    "remainingSessions" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "classId" TEXT,
    "tuitionPlanId" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentLineItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "PaymentCategory" NOT NULL DEFAULT 'TUITION',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT NOT NULL,
    "tuitionPlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLineItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Payment"
  ADD COLUMN "receiptCode" TEXT,
  ADD COLUMN "qrPayload" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "bankAccountName" TEXT,
  ADD COLUMN "bankAccountNo" TEXT;

ALTER TABLE "Attendance"
  ADD COLUMN "enrollmentId" TEXT;

CREATE UNIQUE INDEX "Payment_receiptCode_key" ON "Payment"("receiptCode");
CREATE INDEX "TuitionPlan_courseId_isActive_idx" ON "TuitionPlan"("courseId", "isActive");
CREATE INDEX "Enrollment_studentId_status_idx" ON "Enrollment"("studentId", "status");
CREATE INDEX "Enrollment_classId_status_idx" ON "Enrollment"("classId", "status");
CREATE INDEX "Enrollment_paymentId_idx" ON "Enrollment"("paymentId");
CREATE INDEX "PaymentLineItem_paymentId_idx" ON "PaymentLineItem"("paymentId");
CREATE INDEX "Attendance_enrollmentId_idx" ON "Attendance"("enrollmentId");

ALTER TABLE "TuitionPlan" ADD CONSTRAINT "TuitionPlan_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_tuitionPlanId_fkey"
  FOREIGN KEY ("tuitionPlanId") REFERENCES "TuitionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentLineItem" ADD CONSTRAINT "PaymentLineItem_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentLineItem" ADD CONSTRAINT "PaymentLineItem_tuitionPlanId_fkey"
  FOREIGN KEY ("tuitionPlanId") REFERENCES "TuitionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
