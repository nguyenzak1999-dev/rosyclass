import { env } from "cloudflare:workers"

export interface StoredMedia {
  url: string
  publicId: string
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
  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return null
  return { cloudName, apiKey, apiSecret }
}

async function uploadToCloudinary(file: File, folder: string): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig()
  if (!config) throw new Error("Chưa cấu hình Cloudinary")

  const params = {
    folder: `rosyclass/${folder}`,
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

// Cloudinary Node SDK không chạy được trên Workers nên gọi thẳng REST API có chữ ký
export async function storeImage(file: File, rawFolder: string): Promise<StoredMedia> {
  const result = await uploadToCloudinary(file, sanitizeFolder(rawFolder))

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
    bytes: file.size,
  }
}

export async function deleteStoredImage(media: { publicId: string }) {
  await deleteFromCloudinary(media.publicId)
}
