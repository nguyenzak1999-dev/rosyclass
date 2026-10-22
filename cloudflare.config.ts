import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  // Tài khoản giữ zone rosyclass.edu.vn
  accountId: "1d46985e8d49340b8c9d2cc4c9fa5481",
  worker: defineWorker({
    name: "rosyclass",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-21",
    compatibilityFlags: ["nodejs_compat"],
    // Thêm "rosyclass.edu.vn" và "www.rosyclass.edu.vn" sau khi xoá các bản ghi A trỏ về Vercel
    domains: ["admin.rosyclass.edu.vn"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      VINEXT_KV_CACHE: bindings.kv(),
      DB: bindings.d1({ name: "rosyclass-db", id: "683f38e7-f888-4678-bc36-52a633a1c208" }),

      // Ký cookie phiên đăng nhập admin
      AUTH_SECRET: bindings.secret(),
      // Không khai báo ở đây để deploy không bắt buộc; đặt trong Dashboard → Variables and Secrets:
      // CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, RESEND_API_KEY, TELEGRAM_BOT_TOKEN
    },
  }),
});
