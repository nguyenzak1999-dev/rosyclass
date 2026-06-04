import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("pooler.supabase.com") && !dbUrl.includes("pgbouncer=true")) {
  dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
}
process.env.DATABASE_URL = dbUrl;

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
