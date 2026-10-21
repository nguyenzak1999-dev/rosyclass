# Triển khai RosyClass lên Cloudflare

Toàn bộ hệ thống chạy trên Cloudflare:

| Thành phần | Trước đây | Bây giờ |
| --- | --- | --- |
| Hosting | Vercel (Next.js) | Cloudflare Workers qua [vinext](https://github.com/cloudflare/vinext) |
| Cơ sở dữ liệu | Supabase Postgres | Cloudflare D1 (SQLite), Prisma + `@prisma/adapter-d1` |
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
- Thứ tự làm: tạo tài nguyên → tạo bảng → chuyển dữ liệu → deploy → đặt secret.

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

## 3. Chuyển dữ liệu từ Supabase

```bash
SUPABASE_DATABASE_URL="postgresql://postgres:<mật khẩu>@db.<project>.supabase.co:5432/postgres" \
  npm run db:export-supabase
npx wrangler d1 execute rosyclass-db --remote --file=.cloudflare/d1-data.sql
rm .cloudflare/d1-data.sql   # file chứa dữ liệu cá nhân và hash mật khẩu
```

Script `scripts/export-supabase-to-d1.mjs`:

- đọc mọi bảng của app và chuyển sang câu lệnh `INSERT` cho SQLite (thời gian giữ nguyên UTC);
- ghép mật khẩu bcrypt từ `auth.users` của Supabase vào `User.passwordHash` theo email, nên **người dùng đăng nhập bằng mật khẩu cũ**. Ở lần đăng nhập đầu, mật khẩu được tự nâng cấp sang PBKDF2;
- giữ nguyên URL Cloudinary của các ảnh đã tải lên.

Tạo hoặc đổi mật khẩu một tài khoản quản trị (cần `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` trong `.env`; token cần quyền *D1 Edit*):

```bash
npm run admin:set-password -- admin@rosyclass.edu.vn "MatKhauManh123" "Quản trị viên"
```

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
- Tài khoản tạo mới trong trang quản trị (ví dụ giáo viên) chưa có mật khẩu đăng nhập. Đặt mật khẩu bằng `npm run admin:set-password`.
