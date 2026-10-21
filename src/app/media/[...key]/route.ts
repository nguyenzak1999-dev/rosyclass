import { env } from "cloudflare:workers"

// Ảnh người dùng tải lên được phục vụ từ cùng domain, nên chặn mọi script (vd. SVG độc hại)
const SAFE_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params
  const objectKey = key.map(decodeURIComponent).join("/")

  if (!objectKey.startsWith("rosyclass/") || objectKey.includes("..")) {
    return new Response("Not found", { status: 404 })
  }

  const object = await env.MEDIA.get(objectKey)
  if (!object) {
    return new Response("Not found", { status: 404 })
  }

  const headers = new Headers(SAFE_HEADERS)
  object.writeHttpMetadata(headers)
  headers.set("ETag", object.httpEtag)
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }

  return new Response(object.body, { headers })
}
