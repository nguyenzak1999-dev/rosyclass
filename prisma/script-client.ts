import "dotenv/config"
import { PrismaClient } from "./generated/node/client"
import { PrismaD1 } from "@prisma/adapter-d1"

// Script chạy bằng Node (seed, backfill) không có binding D1, nên kết nối qua D1 HTTP API.
// Cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID và CLOUDFLARE_D1_TOKEN (quyền D1 Edit).
export function createScriptPrisma() {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN } = process.env

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID || !CLOUDFLARE_D1_TOKEN) {
    throw new Error("Thiếu CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID hoặc CLOUDFLARE_D1_TOKEN trong .env")
  }

  const adapter = new PrismaD1({ CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN })
  return new PrismaClient({ adapter })
}
