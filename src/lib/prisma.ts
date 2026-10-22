import { PrismaClient } from '@/generated/prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { env } from 'cloudflare:workers'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Binding D1 dùng lại an toàn giữa các request, nên giữ một PrismaClient cho cả isolate
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter: new PrismaD1(env.DB) })

globalForPrisma.prisma = prisma
