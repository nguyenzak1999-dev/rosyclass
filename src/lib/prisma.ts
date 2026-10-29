import { PrismaClient } from '@/generated/prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { env } from 'cloudflare:workers'
import { getRequestContext, isInsideUnifiedScope } from 'vinext/shims/unified-request-context'

// Mỗi request một PrismaClient. Dùng chung một client cho cả isolate không an toàn trên Workers:
// Prisma gom các findUnique vào một lô và chờ process.nextTick để gửi đi; nếu request đang giữ lô
// bị huỷ (client ngắt kết nối, hot reload…) thì callback không bao giờ chạy, cờ gom lô kẹt lại và
// mọi findUnique về sau của isolate (đăng nhập, cài đặt site…) treo vĩnh viễn.
const clients = new WeakMap<object, PrismaClient>()
let detachedClient: PrismaClient | undefined

function createClient() {
  return new PrismaClient({ adapter: new PrismaD1(env.DB) })
}

function currentClient() {
  // Ngoài phạm vi request (khởi tạo module…) thì dùng một client riêng
  if (!isInsideUnifiedScope()) return (detachedClient ??= createClient())

  const requestContext = getRequestContext()
  let client = clients.get(requestContext)
  if (!client) {
    client = createClient()
    clients.set(requestContext, client)
  }
  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = currentClient()
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
