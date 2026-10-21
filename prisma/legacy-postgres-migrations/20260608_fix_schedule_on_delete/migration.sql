-- Migration: fix_schedule_on_delete
-- Fix FK ClassSession.schedule → SetNull khi xoá ClassSchedule.
-- Trước đây default NoAction/Restrict sẽ chặn xoá schedule nếu còn session trỏ tới.

-- Drop existing FK (auto-generated name)
ALTER TABLE "ClassSession" DROP CONSTRAINT IF EXISTS "ClassSession_scheduleId_fkey";

-- Add new FK with ON DELETE SET NULL
ALTER TABLE "ClassSession"
  ADD CONSTRAINT "ClassSession_scheduleId_fkey"
  FOREIGN KEY ("scheduleId") REFERENCES "ClassSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
