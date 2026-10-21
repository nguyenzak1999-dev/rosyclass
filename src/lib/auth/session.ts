import { env } from "cloudflare:workers"

export const SESSION_COOKIE = "rosy_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 ngày

export interface SessionPayload {
  uid: string
  exp: number
  // Dấu vân tay của passwordHash: đổi mật khẩu sẽ vô hiệu hoá các phiên cũ
  pv: string
}

const encoder = new TextEncoder()

function base64UrlEncode(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)), (char) => char.charCodeAt(0))
}

async function getKey() {
  const secret = env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET chưa được cấu hình hoặc ngắn hơn 32 ký tự")
  }
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

export async function passwordFingerprint(passwordHash: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(passwordHash))
  return base64UrlEncode(new Uint8Array(digest)).slice(0, 16)
}

export async function createSessionToken(userId: string, passwordHash: string) {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    pv: await passwordFingerprint(passwordHash),
  }
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body))
  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`
}

/** Chỉ kiểm tra chữ ký và hạn dùng, không truy vấn DB (dùng được trong proxy). */
export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      base64UrlDecode(signature) as BufferSource,
      encoder.encode(body)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
}
