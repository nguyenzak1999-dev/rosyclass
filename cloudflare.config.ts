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
      DB: bindings.d1({ name: "rosyclass-db", id: "41752056-3142-4beb-be13-d74175a7698a" }),

      // Ký cookie phiên đăng nhập admin
      AUTH_SECRET: bindings.secret(),
      // Không khai báo ở đây để deploy không bắt buộc; đặt trong Dashboard → Variables and Secrets:
      // CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, RESEND_API_KEY, TELEGRAM_BOT_TOKEN
    },
  }),
});
