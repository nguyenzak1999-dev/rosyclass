# Kế hoạch thiết kế lại Trang chủ RosyClass theo Style "Geniestudio"

## 1. Mục tiêu
Thiết kế lại trang chủ của Trung tâm Tiếng Anh RosyClass (`src/app/(public)/page.tsx` và `layout.tsx`) để áp dụng ngôn ngữ thiết kế **Geniestudio** (không gian xanh pastel, không gian trắng rộng rãi, typography gọn gàng, các thẻ (card) bo tròn lớn). Đồng thời giữ nguyên cấu trúc nội dung là một Trung tâm Tiếng Anh chuyên nghiệp.

## 2. Hệ thống Tokens & Design System cần áp dụng
Dựa trên tài liệu Geniestudio, chúng ta sẽ tùy biến Tailwind config hoặc CSS toàn cục để phản ánh chính xác các token:

### Colors (Màu sắc)
- **Background (Sky Wash):** `#ebf5ff` - Màu nền chính của toàn trang.
- **Card Surface (Paper White):** `#fafdff` - Màu nền của các khối, card nổi.
- **Primary Text (Midnight Ink):** `#0a0d12` - Chữ tiêu đề và nội dung chính.
- **Primary CTA (Pressed Charcoal):** `#181d27` - Màu của nút bấm chính.
- **Border/Muted Text (Stone & Fog):** `#535862` (viền mảnh 1px) & `#93979f` (chữ phụ).
- **Accents:** Dùng các màu sắc tươi sáng (Cornflower `#4fbeff`, Tangerine `#f26110`, Amethyst `#9552e0`, Mustard `#bb9915`) cho các thẻ tag, icon.

### Typography & Spacing
- **Fonts:** Sử dụng font *Geist* (nếu Next.js project đã có) hoặc *Inter* thay thế cho body text và heading với letter-spacing hẹp.
- **Radii (Độ bo góc):** Đặc trưng của style này là bo góc siêu lớn: `32px` cho Card, `9999px` cho Button, `16px` cho Icon/Hình ảnh.
- **Shadow (Đổ bóng):** Không dùng shadow tối màu. Chỉ sử dụng viền mảnh 1px màu *Stone* để phân tách.
- **Spacing:** Khoảng cách lớn (64px - 80px) giữa các section, tạo cảm giác "thoáng khí".

## 3. Các thay đổi cụ thể trên Giao diện (UI)

### 3.1. Thiết lập CSS Variables (globals.css)
- Thêm toàn bộ các biến `--color-sky-wash`, `--color-paper-white`... theo bảng mã màu.

### 3.2. Layout & Header (`layout.tsx`)
- Thay nền layout bằng *Sky Wash* (`#ebf5ff`).
- Header làm trong suốt, khi cuộn có thể đổi thành nền trắng, viền dưới mỏng 1px màu *Stone*.
- Gỡ bỏ background tối/gradient ở Topbar.
- Nút "Đăng nhập" chuyển sang màu *Pressed Charcoal*, chữ trắng, bo tròn `9999px`.

### 3.3. Hero Section (`page.tsx`)
- Bố cục căn giữa (Centered stack).
- **Headline:** Font size cực lớn, chữ màu *Midnight Ink*, khoảng cách chữ (tracking) âm (`-1.44px`).
- **Nút CTA chính:** Màu *Pressed Charcoal* (`#181d27`), padding lớn.
- **Hình ảnh:** Hình học viên/không khí lớp học được cắt cúp bo tròn `16-32px`, nằm tự do.

### 3.4. Các Section tiếp theo (Khóa học, Vì sao chọn)
- **Feature Cards (Card màu sắc - Tinted Callout):** Áp dụng các dải màu tint (Morning Tint, Lilac Mist, Sprout). Bo tròn `32px`, không border, không shadow. 
- **Testimonial / Thông tin:** Sử dụng nền *Paper White*, border 1px *Stone*, bo góc `32px`.

### 3.5. Footer
- Thay Footer tối màu (bg-slate-900) thành Footer sáng nền *Veil* hoặc *Sky Wash*, chữ *Midnight Ink* / *Stone* để đồng bộ với theme "light and playful".

## 4. Các bước triển khai (Checklist)
- [ ] Bước 1: Cập nhật CSS variables vào `globals.css` và điều chỉnh Tailwind config.
- [ ] Bước 2: Chỉnh sửa `layout.tsx`: Layout sáng, Header trong suốt, Header button thành Pressed Charcoal.
- [ ] Bước 3: Đập đi xây lại `page.tsx`: Căn giữa Hero Section, áp dụng các Tinted Card bo tròn 32px cho Khóa học và Tính năng. Cập nhật Footer.
- [ ] Bước 4: Review tương tác mượt mà và khoảng cách chuẩn 80px.
