import { env } from "cloudflare:workers"

export const MEDIA_ROUTE_PREFIX = "/media/"

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
}

export interface StoredMedia {
  url: string
  publicId: string
  storageKey: string | null
  cloudinaryUrl: string | null
  format: string | null
  width: number | null
  height: number | null
  bytes: number
}

interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  format?: string
  width?: number
  height?: number
}

function sanitizeFolder(folder: string) {
  return folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general"
}

async function sha1Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Chữ ký Cloudinary: sắp xếp tham số theo tên, nối "k=v" bằng "&", thêm api_secret rồi SHA-1
async function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return sha1Hex(payload + apiSecret)
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return null
  return { cloudName, apiKey, apiSecret }
}

async function uploadToCloudinary(file: File, folder: string, publicId: string): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig()
  if (!config) throw new Error("Chưa cấu hình Cloudinary")

  const params = {
    folder: `rosyclass/${folder}`,
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  }
  const body = new FormData()
  body.set("file", file)
  for (const [key, value] of Object.entries(params)) body.set(key, value)
  body.set("api_key", config.apiKey)
  body.set("signature", await signCloudinaryParams(params, config.apiSecret))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body,
  })
  if (!response.ok) {
    throw new Error(`Cloudinary trả về ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

async function deleteFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig()
  if (!config) return

  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) }
  const body = new FormData()
  for (const [key, value] of Object.entries(params)) body.set(key, value)
  body.set("api_key", config.apiKey)
  body.set("signature", await signCloudinaryParams(params, config.apiSecret))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: "POST",
    body,
  })
  if (!response.ok) {
    throw new Error(`Cloudinary trả về ${response.status}: ${await response.text()}`)
  }
}

/**
 * Tải ảnh lên song song R2 (bản chính, phục vụ qua /media/...) và Cloudinary (bản sao).
 * Chỉ báo lỗi khi cả hai nơi đều thất bại.
 */
export async function storeImage(file: File, rawFolder: string): Promise<StoredMedia> {
  const folder = sanitizeFolder(rawFolder)
  const id = crypto.randomUUID()
  const extension = EXTENSIONS[file.type] || file.name.split(".").pop()?.toLowerCase() || "bin"
  const storageKey = `rosyclass/${folder}/${id}.${extension}`

  const [r2Result, cloudinaryResult] = await Promise.allSettled([
    env.MEDIA.put(storageKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { originalName: file.name },
    }),
    uploadToCloudinary(file, folder, id),
  ])

  if (r2Result.status === "rejected") console.error("[MEDIA] R2 upload failed", r2Result.reason)
  if (cloudinaryResult.status === "rejected") console.error("[MEDIA] Cloudinary upload failed", cloudinaryResult.reason)

  const storedInR2 = r2Result.status === "fulfilled"
  const cloudinary = cloudinaryResult.status === "fulfilled" ? cloudinaryResult.value : null

  if (!storedInR2 && !cloudinary) {
    throw new Error("Không thể tải ảnh lên R2 lẫn Cloudinary")
  }

  return {
    url: storedInR2 ? `${MEDIA_ROUTE_PREFIX}${storageKey}` : cloudinary!.secure_url,
    publicId: cloudinary?.public_id || storageKey,
    storageKey: storedInR2 ? storageKey : null,
    cloudinaryUrl: cloudinary?.secure_url || null,
    format: cloudinary?.format || extension,
    width: cloudinary?.width ?? null,
    height: cloudinary?.height ?? null,
    bytes: file.size,
  }
}

export async function deleteStoredImage(media: { publicId: string; storageKey: string | null; cloudinaryUrl: string | null }) {
  const results = await Promise.allSettled([
    media.storageKey ? env.MEDIA.delete(media.storageKey) : Promise.resolve(),
    media.cloudinaryUrl ? deleteFromCloudinary(media.publicId) : Promise.resolve(),
  ])

  for (const result of results) {
    if (result.status === "rejected") console.error("[MEDIA] delete failed", result.reason)
  }
}
