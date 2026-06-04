import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("pooler.supabase.com") && !dbUrl.includes("pgbouncer=true")) {
  dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
}

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    // @ts-ignore
    datasources: {
      db: {
        url: dbUrl
      }
    }
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
