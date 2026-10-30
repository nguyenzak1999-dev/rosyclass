-- Miễn/giảm học phí mặc định (%) của học viên, áp vào phiếu thu tháng
ALTER TABLE "Student" ADD COLUMN "tuitionDiscountPercent" REAL NOT NULL DEFAULT 0;
