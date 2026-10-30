-- Trang tự tạo bằng page builder có thể hiện trên menu website
ALTER TABLE "Page" ADD COLUMN "showInMenu" BOOLEAN NOT NULL DEFAULT false;
