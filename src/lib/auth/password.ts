import bcrypt from "bcryptjs"

// Workers giới hạn PBKDF2 ở tối đa 100.000 vòng
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_PREFIX = "pbkdf2"

function toBase64(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256
  )
  return new Uint8Array(bits)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export function isBcryptHash(stored: string) {
  return /^\$2[aby]\$\d{2}\$/.test(stored)
}

/**
 * Hỗ trợ hai định dạng: PBKDF2 (mặc định mới) và bcrypt (mật khẩu chuyển từ Supabase Auth).
 * Trả về false với hash giả như "dummy_hash_..." của tài khoản chưa đặt mật khẩu.
 */
export async function verifyPassword(password: string, stored: string) {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(password, stored)
  }

  const [prefix, iterations, salt, hash] = stored.split("$")
  if (prefix !== PBKDF2_PREFIX || !iterations || !salt || !hash) return false

  const derived = await derive(password, fromBase64(salt), Number(iterations))
  return timingSafeEqual(derived, fromBase64(hash))
}
