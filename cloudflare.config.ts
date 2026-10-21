import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "rosyclass",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-21",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      VINEXT_KV_CACHE: bindings.kv(),
      DB: bindings.d1({ name: "rosyclass-db" }),

      // Ký cookie phiên đăng nhập admin
      AUTH_SECRET: bindings.secret(),
      // Cloudinary lưu toàn bộ ảnh tải lên
      CLOUDINARY_API_KEY: bindings.secret(),
      CLOUDINARY_API_SECRET: bindings.secret(),
      RESEND_API_KEY: bindings.secret(),
      TELEGRAM_BOT_TOKEN: bindings.secret(),
    },
  }),
});
