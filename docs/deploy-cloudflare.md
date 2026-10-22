# Triển khai RosyClass lên Cloudflare

Toàn bộ hệ thống chạy trên Cloudflare:

| Thành phần | Trước đây | Bây giờ |
| --- | --- | --- |
| Hosting | Vercel (Next.js) | Cloudflare Workers qua [vinext](https://github.com/cloudflare/vinext) |
| Cơ sở dữ liệu | Supabase Postgres | Cloudflare D1 (SQLite), Prisma + `@prisma/adapter-d1`, bắt đầu với database mới |
| Đăng nhập admin | Supabase Auth | Bảng `User` + cookie phiên ký HMAC (`src/lib/auth/session.ts`) |
| Ảnh | Cloudinary (Node SDK) | Cloudinary (gọi REST API có chữ ký, vì SDK không chạy trên Workers) |
| Cache ISR / `revalidatePath` | Vercel | Workers KV (`VINEXT_KV_CACHE`) |

Cấu hình Worker nằm trong `cloudflare.config.ts`; migration D1 nằm trong `migrations/`.

## 0. Yêu cầu

- Node.js **≥ 22.18** (CLI `cf` yêu cầu). Kiểm tra: `node -v`.
- Đăng nhập Cloudflare (mở trình duyệt để xác nhận):

  ```bash
  npx cf auth login        # đăng nhập
  npx cf auth list         # kiểm tra đã đăng nhập tài khoản nào
  npx cf auth logout       # đăng xuất
  ```

  Khi chạy CI, thay bằng biến môi trường `CLOUDFLARE_API_TOKEN` (template *Edit Cloudflare Workers*) và `CLOUDFLARE_ACCOUNT_ID`.
- Thứ tự làm: tạo tài nguyên → tạo bảng → dữ liệu nền và admin → deploy → đặt secret.

## 1. Tạo tài nguyên

Tạo D1 `rosyclass-db`, bằng Cloudflare Dashboard (*Storage & Databases*) hoặc CLI:

```bash
npx cf d1 create --name rosyclass-db     # ghi lại database ID
```

Thêm ID của D1 vào `cloudflare.config.ts` để các lệnh migration dùng đúng database:

```ts
DB: bindings.d1({ name: "rosyclass-db", id: "<DATABASE_ID>" }),
```

Namespace KV `VINEXT_KV_CACHE` khai báo không kèm ID; nếu lần deploy đầu báo thiếu, tạo một KV namespace trong Dashboard rồi điền ID tương tự.

## 2. Tạo bảng

```bash
npx cf d1 migrations apply <DATABASE_ID>
```

Khi đổi `prisma/schema.prisma` về sau, tạo migration mới bằng cách so sánh với schema đang chạy rồi lưu vào `migrations/000N_ten.sql`:

```bash
npx prisma migrate diff --from-local-d1 --to-schema prisma/schema.prisma --script --output migrations/0002_ten.sql
```

> **Cẩn thận khi thêm khoá ngoại vào bảng đã có dữ liệu.** Với SQLite, Prisma sinh kiểu "tạo `new_X` → `INSERT … SELECT` → `DROP TABLE X`". D1 luôn bật `foreign_keys` (bỏ qua `PRAGMA foreign_keys=OFF`), nên `DROP TABLE` kéo theo `ON DELETE CASCADE` và **xoá sạch dữ liệu ở các bảng con** (đã kiểm chứng trên D1 local). Nếu chỉ thêm cột khoá ngoại nullable, sửa tay thành `ALTER TABLE "X" ADD COLUMN "yId" TEXT REFERENCES "Y" ("id") ON DELETE SET NULL ON UPDATE CASCADE;` như `migrations/0002_grade1_curriculum.sql`.

## 3. Dữ liệu nền và tài khoản admin

Hệ thống bắt đầu với database trống (không chuyển dữ liệu từ Supabase). Nạp vai trò, quyền và cấu hình website mặc định; lệnh chạy lại nhiều lần vẫn an toàn:

```bash
npm run db:bootstrap
```

Tạo tài khoản quản trị đầu tiên, hoặc đổi mật khẩu cho tài khoản đã có. Mật khẩu được hỏi khi chạy và không hiện lúc gõ:

```bash
npm run admin:create -- admin@rosyclass.edu.vn "Họ tên"
```

Nạp nội dung khởi đầu cho trung tâm trẻ em: 15 câu hỏi kiểm tra trình độ (đã xuất bản), 5 chương trình học (ở trạng thái nháp, cần điền học phí rồi bật hiển thị) và FAQ cho phụ huynh:

```bash
npm run db:seed-kids
```

Các lệnh trên chạy SQL trên D1 thật bằng phiên `npx cf auth login`, không cần token riêng.

## 4. Biến môi trường, deploy và secret

Biến công khai được nhúng lúc build, đặt trong `.env` (hoặc trong biến môi trường của CI):

```bash
NEXT_PUBLIC_APP_URL=https://rosyclass.edu.vn
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
```

Deploy lần đầu:

```bash
npm run deploy
```

Sau khi Worker `rosyclass` đã tồn tại, đặt secret (mỗi lệnh tạo một phiên bản Worker mới):

```bash
npx cf workers secrets update AUTH_SECRET --worker rosyclass --type secret_text --text "$(openssl rand -hex 32)"
npx cf workers secrets update CLOUDINARY_API_KEY --worker rosyclass --type secret_text --text "<api key>"
npx cf workers secrets update CLOUDINARY_API_SECRET --worker rosyclass --type secret_text --text "<api secret>"
npx cf workers secrets update RESEND_API_KEY --worker rosyclass --type secret_text --text "<key>"
npx cf workers secrets update TELEGRAM_BOT_TOKEN --worker rosyclass --type secret_text --text "<token>"
```

Lệnh `--text` để lại giá trị trong lịch sử shell; có thể đặt secret trong Dashboard (Worker → *Settings* → *Variables and Secrets*) thay thế. Các biến `PAYMENT_BANK_*` và `VIETQR_BANK_CODE` (nếu dùng) đặt tương tự.

Cuối cùng vào Worker `rosyclass` → *Domains & Routes* để gắn `rosyclass.edu.vn`. Những lần sau chỉ cần `npm run deploy`.

## Chạy local

```bash
cp .env.example .env    # điền AUTH_SECRET và khoá Cloudinary để tải ảnh
npm run dev             # http://localhost:5173, D1/KV được giả lập cục bộ
```

Lần đầu chạy local cần tạo bảng trong D1 cục bộ: khi `npm run dev` đang chạy, gửi nội dung `migrations/0001_init.sql` tới endpoint giả lập:

```bash
python3 -c "import json;print(json.dumps({'sql':open('migrations/0001_init.sql').read()}))" | \
  curl -s -X POST http://localhost:5173/cdn-cgi/local/explorer/api/d1/database/DB-rosyclass/raw \
  -H 'Content-Type: application/json' -d @-
```

## Lưu ý

- **D1 không hỗ trợ transaction.** Các `prisma.$transaction(...)` (ghi danh, thu học phí, chuyển lead thành học viên...) vẫn chạy nhưng từng câu lệnh độc lập; nếu một bước lỗi giữa chừng, các bước trước không được hoàn tác.
- Tìm kiếm `contains` trên SQLite chỉ không phân biệt hoa/thường với chữ không dấu.
- `next/image` không tự resize ảnh khi chạy vinext. Ảnh trên Cloudinary vẫn có thể dùng tham số biến đổi của Cloudinary.
- Tài khoản tạo mới trong trang quản trị (ví dụ giáo viên) chưa có mật khẩu đăng nhập. Đặt mật khẩu bằng `npm run admin:create -- <email>`.
