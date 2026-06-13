# Đặc tả Tính năng: Xếp Lớp, Học Phí, Điểm Danh & Học Bù (Tinh Gọn)

Tài liệu này đặc tả chi tiết kiến trúc dữ liệu, luồng nghiệp vụ và giao diện của module Xếp lớp, Quản lý học phí, Điểm danh và Học bù theo **mô hình tinh gọn, thực dụng**.

---

## 1. Tóm tắt Nghiệp vụ (KISS - Keep It Simple)

1. **Khóa học (Course) & Lớp học (Class)**: Course là biểu mẫu/thư mục. Class là lớp học thực tế có thời khóa biểu, sĩ số và **Học phí riêng**.
2. **Ghi danh (ClassStudent & Payment)**: Đăng ký học viên thẳng vào `Class`. Hệ thống tự động tạo 1 `Payment` (Phiếu thu) đại diện cho học phí của lớp đó.
3. **Điểm danh (Attendance)**: Giáo viên check điểm danh từng buổi (`ClassSession`).
4. **Học bù cực nhanh (Make-up)**: Học viên vắng có phép (`EXCUSED`) sẽ hiển thị ở danh sách "Cần học bù". Admin chỉ cần chọn học viên này và thêm vào một buổi học của lớp khác với trạng thái điểm danh là `MAKE_UP`. Không cần "Vé", "Sổ cái" hay các bước trung gian.
5. **Phiếu thu kèm QR thanh toán**: Mỗi `Payment` tích hợp mã **VietQR** để học viên chuyển khoản tự động.

---

## 2. Thiết kế Cơ sở Dữ liệu (Prisma Schema)

Mô hình đã được tối giản, lược bỏ hoàn toàn các bảng phức tạp (`TuitionPlan`, `Enrollment`, `SessionCreditLedger`, `MakeUpCredit`).

```mermaid
erDiagram
    Course ||--o{ Class : "co"
    Student ||--o{ ClassStudent : "tham-gia"
    Class ||--o{ ClassStudent : "co"
    Student ||--o{ Payment : "thanh-toan-cho"
    Class ||--o{ Payment : "cua-lop"
    Payment ||--|{ PaymentLineItem : "chi-tiet"
    ClassSession ||--o{ Attendance : "diem-danh"
    Student ||--o{ Attendance : "cua"
```

### 2.1. Lớp học & Ghi danh (`Class` & `ClassStudent`)
Học phí được quy định tại lớp. Việc thêm học viên vào lớp tương đương với việc đăng ký học.

```prisma
model Class {
  // ... (cơ bản: id, name, maxStudents, startDate, status...)
  tuitionFee Float? // Học phí trọn gói của lớp này
  
  students  ClassStudent[]
  payments  Payment[]
  sessions  ClassSession[]
}

model ClassStudent {
  classId   String
  studentId String
  status    StudentClassStatus @default(ACTIVE) // ACTIVE, DROPPED
  joinedAt  DateTime           @default(now())
}
```

### 2.2. Điểm danh (`Attendance` & `ClassSession`)
Điểm danh rất đơn giản, không kéo theo bất kỳ sổ cái phức tạp nào.
```prisma
enum AttendanceStatus {
  PRESENT                     // Có mặt
  ABSENT_WITH_PERMISSION      // Vắng có phép (Được xếp học bù)
  ABSENT_WITHOUT_PERMISSION   // Vắng không phép
  LATE                        // Trễ
  MAKE_UP                     // Học viên khách từ lớp khác sang học bù
}

model Attendance {
  id        String           @id @default(uuid())
  status    AttendanceStatus
  sessionId String
  studentId String
}
```

### 2.3. Thanh toán (`Payment`)
Quản lý tiền nong minh bạch, dễ hiểu. `Payment` gắn liền với `Class`.
```prisma
model Payment {
  id              String        @id @default(uuid())
  receiptCode     String?       @unique
  totalAmount     Float         // Học phí lớp + phụ phí
  paidAmount      Float         @default(0)
  remainingAmount Float         @default(0)
  status          PaymentStatus @default(UNPAID)
  
  // Tích hợp QR
  qrPayload       String?       @db.Text
  
  studentId       String
  classId         String?       // Gắn vào lớp nào
}
```

---

## 3. Luồng Logic Nghiệp Vụ (Logic Flows)

### 3.1. Ghi danh & Tạo phiếu thu
1. Admin vào trang chi tiết Lớp A.
2. Bấm **"Thêm học viên"** -> Chọn "Nguyễn Văn A".
3. Form hiện ra: "Xác nhận thêm học viên. Học phí lớp này là 5.000.000đ".
4. Admin bấm "Lưu".
5. Hệ thống insert vào `ClassStudent` và tự động tạo 1 `Payment` trị giá 5.000.000đ (Trạng thái `UNPAID`).

### 3.2. Điểm danh & Học bù
1. **Điểm danh:** Giáo viên điểm danh Lớp A. Nguyễn Văn A xin phép nghỉ -> Đánh `ABSENT_WITH_PERMISSION`.
2. **Cảnh báo học bù:** Trong tab "Học bù", Nguyễn Văn A xuất hiện trong danh sách "Cần học bù (1 buổi)".
3. **Xếp học bù:** Admin bấm "Xếp bù" -> Tìm Lớp B có trình độ tương đương đang học bài đó -> Chọn Lớp B.
4. **Kết quả:** Nguyễn Văn A được chèn vào danh sách điểm danh buổi đó của Lớp B với cờ `MAKE_UP`. Không trừ tiền, không rắc rối sổ cái.

---

## 4. Giao diện UI

1. **Tab "Quản lý Lớp"**:
   - Nút "Thêm học viên vào lớp" (Tạo ClassStudent + Payment).
2. **Tab "Học Bù" (Dành cho Lễ tân/Admin)**:
   - Danh sách: Nhóm theo học viên -> Các buổi vắng có phép.
   - Nút "Xếp vào lớp khác".
3. **Tab "Phiếu thu" (Dành cho Kế toán)**:
   - Danh sách các Payment. Có thể thêm dòng chi tiết thủ công (Giảm giá, Tiền sách...).
   - Nút "In biên lai" và "Hiển thị QR Code".
4. **Tab "Điểm danh"**:
   - Giao diện dạng lưới (Grid) hiển thị danh sách học viên theo cột ngày học. Tích nhanh Có mặt/Vắng.
