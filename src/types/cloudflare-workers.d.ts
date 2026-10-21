// Khai báo tối thiểu cho các binding mà app dùng. Không include toàn bộ runtime types của
// Workers vì chúng ghi đè kiểu DOM (vd. Response.json() trả về unknown) ở code client.
declare module "cloudflare:workers" {
  import type { D1Database } from "@cloudflare/workers-types"

  interface R2PutOptions {
    httpMetadata?: { contentType?: string; cacheControl?: string }
    customMetadata?: Record<string, string>
  }

  interface R2Object {
    key: string
    size: number
    etag: string
    httpEtag: string
    uploaded: Date
    httpMetadata?: { contentType?: string; cacheControl?: string }
    writeHttpMetadata(headers: Headers): void
  }

  interface R2ObjectBody extends R2Object {
    body: ReadableStream
  }

  interface R2Bucket {
    put(key: string, value: ArrayBuffer | ReadableStream | string | Blob, options?: R2PutOptions): Promise<R2Object | null>
    get(key: string): Promise<R2ObjectBody | null>
    delete(key: string | string[]): Promise<void>
  }

  interface RosyEnv {
    DB: D1Database
    MEDIA: R2Bucket
    AUTH_SECRET: string
    CLOUDINARY_API_KEY?: string
    CLOUDINARY_API_SECRET?: string
    RESEND_API_KEY?: string
    TELEGRAM_BOT_TOKEN?: string
  }

  export const env: RosyEnv
}
