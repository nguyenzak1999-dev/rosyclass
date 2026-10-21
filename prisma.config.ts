import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migration của D1 do Cloudflare quản lý (thư mục migrations/), Prisma chỉ dùng để
// sinh client và sinh SQL bằng `prisma migrate diff`. Xem docs/deploy-cloudflare.md.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  // Chỉ để CLI có datasource hợp lệ khi chạy `prisma migrate diff`; app dùng binding D1
  datasource: {
    url: "file:./.cloudflare/prisma-cli.db",
  },
});
