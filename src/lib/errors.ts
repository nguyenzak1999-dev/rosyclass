/**
 * Helper xử lý error an toàn với type, thay thế pattern `error as any`.
 * Hỗ trợ Prisma error (P2002 unique constraint) và Error thông thường.
 */

type PrismaKnownError = {
  code?: string
  message?: string
  meta?: Record<string, unknown>
}

export function getErrorMessage(error: unknown, fallback = "Có lỗi xảy ra"): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }
  return fallback
}

export function isPrismaUniqueError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaKnownError).code === "P2002"
  )
}
