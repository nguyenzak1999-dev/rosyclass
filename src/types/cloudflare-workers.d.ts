// Khai báo tối thiểu cho các binding mà app dùng. Không include toàn bộ runtime types của
// Workers vì chúng ghi đè kiểu DOM (vd. Response.json() trả về unknown) ở code client.
declare module "cloudflare:workers" {
  import type { D1Database } from "@cloudflare/workers-types"

  interface RosyEnv {
    DB: D1Database
    AUTH_SECRET: string
    CLOUDINARY_API_KEY?: string
    CLOUDINARY_API_SECRET?: string
    RESEND_API_KEY?: string
    TELEGRAM_BOT_TOKEN?: string
  }

  export const env: RosyEnv
}
