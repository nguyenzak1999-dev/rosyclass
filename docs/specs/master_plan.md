# Kế Hoạch & Checklist Triển Khai: RosyClass (English Center Management System)

Đây là bản kế hoạch tổng thể (Master Plan) được chia thành các Phase (Giai đoạn) cụ thể để xây dựng toàn bộ dự án từ A-Z. Hãy tick (✅) vào các mục sau khi hoàn thành.

---

## Giai đoạn 1: Khởi tạo và Cấu hình nền tảng (Foundation)
- [x] Khởi tạo dự án Next.js 15 (App Router, TS, TailwindCSS).
- [x] Cài đặt UI Framework (Shadcn UI, Lucide Icons).
- [x] Cài đặt các thư viện lõi (React Hook Form, Zod, Recharts, Date-fns, Tanstack Table).
- [x] Cài đặt Database ORM & Cloud services (Prisma, Supabase, Cloudinary).
- [x] Thiết kế Database Schema (`prisma/schema.prisma`) dựa trên `main.md`.
- [x] Chạy migration lần đầu (`npx prisma db push` hoặc `migrate dev`).
- [x] Cấu hình Supabase Auth và các API keys trong `.env`.
- [x] Viết script Seed data mẫu (`prisma/seed.ts`).

## Giai đoạn 2: Kiến trúc Layout & Authentication
- [x] Thiết lập Provider (Query Client, Theme Provider, Session Provider).
- [x] Xây dựng **Admin Layout**:
  - [x] Sidebar Navigation (có phân quyền).
  - [x] Top Header (User avatar, Notification, Theme toggle).
  - [x] Breadcrumb system.
- [x] Xây dựng **Public Website Layout**:
  - [x] Header (Logo, Menu, Nút Đăng nhập/Test).
  - [x] Footer.
- [x] Tích hợp Supabase Authentication (Login, Logout).
- [x] Phân quyền Route (Role-based access control: SUPER_ADMIN, ADMIN, TEACHER...).

## Giai đoạn 3: Phát triển Core Modules (Admin Dashboard)

### 3.1. Quản lý hệ thống cơ sở (Settings)
- [ ] Cấu hình Chi nhánh (Branches) & Phòng học (Rooms).
- [ ] Quản lý người dùng và Phân quyền (Users & Roles).

### 3.2. Quản lý Khoá học (Courses)
- [x] Form Tạo/Sửa khoá học (Tên, Cấp độ, Giá, Số buổi...).
- [ ] Tích hợp Cloudinary để upload Thumbnail khoá học.
- [x] Danh sách Khoá học (Data table với bộ lọc & phân trang).

### 3.3. CRM: Quản lý Leads (Khách hàng tiềm năng)
- [ ] Form Đăng ký tư vấn/Tạo Lead (Public & Admin).
- [x] Bảng quản lý Leads (Lọc theo trạng thái, nguồn, nhân viên...).
- [ ] Trang chi tiết Lead (Timeline, Ghi chú, Đặt lịch test).
- [ ] Logic chuyển đổi Lead thành Học viên (Convert to Student).

### 3.4. Quản lý Học viên & Phụ huynh
- [ ] CRUD Phụ huynh (Liên kết nhiều học viên).
- [x] Bảng danh sách Học viên.
- [x] Form Thêm/Sửa Học viên.
- [ ] Hồ sơ Học viên (Thông tin, Lịch sử lớp học, Điểm danh, Điểm số, Công nợ).

### 3.5. Quản lý Lớp học & Xếp lớp
- [ ] Form Tạo Lớp học (Gắn khoá học, giáo viên, phòng, lịch...).
- [x] Bảng danh sách Lớp học (Trạng thái, sĩ số).
- [ ] Giao diện **Xếp lớp (Arrange Class)**:
  - [ ] Kéo thả/Chọn Học viên chờ lớp -> Lớp phù hợp.
  - [ ] Kiểm tra logic: Không vượt quá `maxStudents`.

### 3.6. Lịch học & Điểm danh (Schedule & Attendance)
- [ ] Tạo Session định kỳ cho lớp học.
- [x] Lịch (Calendar view) cho quản lý và giáo viên.
- [x] Giao diện Điểm danh (Tối ưu cho mobile, check Present/Absent/Late).

### 3.7. Kế toán & Công nợ (Payments)
- [ ] Tạo phiếu thu (Học phí, Partial payment, Full payment).
- [x] Bảng theo dõi Công nợ học viên.

### 3.8. Quản lý Giáo viên (Teachers)
- [x] CRUD Giáo viên (Thông tin, Avatar, Bằng cấp).
- [ ] Tính lương cơ bản dựa trên Session đã dạy (`COMPLETED`).

## Giai đoạn 4: Public Website & CMS

### 4.1. CMS Engine
- [ ] Quản lý Pages (Giới thiệu, Liên hệ...).
- [ ] Quản lý Blog (Bài viết, Danh mục).
- [ ] Quản lý Banners & Testimonials.

### 4.2. Giao diện Website (Front-end)
- [ ] Trang chủ (Hero banner, Testimonials, Highlight Courses).
- [ ] Trang Danh sách Khoá học & Chi tiết.
- [ ] Trang Đội ngũ Giáo viên.
- [ ] Trang Bài viết (Blog list & detail).
- [ ] Trang Đặt lịch Placement Test & Đăng ký tư vấn.

## Giai đoạn 5: Dashboard Analytics & Reports
- [ ] Thiết kế các thẻ chỉ số (Cards): Tổng Leads, Doanh thu, Lớp học đang mở...
- [ ] Vẽ Biểu đồ (Recharts): Doanh thu theo tháng, Nguồn Leads, Tỉ lệ lấp đầy lớp.
- [ ] Các báo cáo chi tiết dạng bảng (Báo cáo nợ, Báo cáo giảng dạy).

## Giai đoạn 6: Testing, Optimization & Deployment
- [ ] Review UI/UX & Responsive toàn bộ hệ thống.
- [ ] Tối ưu hóa Database Queries.
- [ ] Kiểm tra phân quyền bảo mật (Middleware & RLS trên Supabase).
- [ ] Triển khai lên Vercel.
- [ ] Bàn giao.
