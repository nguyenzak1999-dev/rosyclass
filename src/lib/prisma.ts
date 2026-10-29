/// <reference types="vite/client" />
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { env } from 'cloudflare:workers'
import { getRequestContext, isInsideUnifiedScope } from 'vinext/shims/unified-request-context'

function createClient() {
  return new PrismaClient({ adapter: new PrismaD1(env.DB) })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Production: một PrismaClient cho cả isolate. Tạo client tốn ~10ms CPU (dựng bộ biên dịch truy vấn), làm mỗi
// request sẽ vượt giới hạn CPU của Worker ("Worker exceeded resource limits", 503).
//
// Dev: mỗi request một client. Hot reload huỷ request đang giữ lô findUnique của Prisma (chờ process.nextTick),
// cờ gom lô kẹt lại và mọi findUnique về sau của isolate treo, khiến cả khu admin trả 500 nhiều phút.
function devClientPerRequest() {
  const clients = new WeakMap<object, PrismaClient>()
  const current = () => {
    if (!isInsideUnifiedScope()) return (globalForPrisma.prisma ??= createClient())
    const requestContext = getRequestContext()
    let client = clients.get(requestContext)
    if (!client) {
      client = createClient()
      clients.set(requestContext, client)
    }
    return client
  }
  return new Proxy({} as PrismaClient, {
    get(_target, property) {
      const client = current()
      const value = Reflect.get(client, property, client)
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

export const prisma: PrismaClient = import.meta.env.DEV
  ? devClientPerRequest()
  : (globalForPrisma.prisma ??= createClient())
