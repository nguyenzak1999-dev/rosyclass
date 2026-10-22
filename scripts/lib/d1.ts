import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

// Script quản trị chạy SQL trên D1 thật qua CLI `cf` (dùng phiên `cf auth login` sẵn có).
// `cf` cần Node ≥ 22.18; máy chạy Node cũ hơn thì tự mượn Node 22 qua npx.
const CF_BIN = "node_modules/cf/bin/cf"

function nodeIsRecentEnough() {
  const [major, minor] = process.versions.node.split(".").map(Number)
  return major > 22 || (major === 22 && minor >= 18)
}

export function getDatabaseId() {
  const fromEnv = process.env.CLOUDFLARE_DATABASE_ID
  if (fromEnv) return fromEnv

  const config = readFileSync("cloudflare.config.ts", "utf8")
  const id = config.match(/bindings\.d1\(\{[^}]*id:\s*"([^"]+)"/)?.[1]
  if (!id) throw new Error("Không tìm thấy ID của D1 trong cloudflare.config.ts")
  return id
}

export function sqlString(value: string | null) {
  return value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`
}

export function nowIso() {
  // Cùng định dạng @prisma/adapter-d1 ghi DateTime
  return new Date().toISOString().replace("Z", "+00:00")
}

// D1_LOCAL=1: chạy vào D1 giả lập của `npm run dev` (http://localhost:5173) thay vì D1 remote.
// Đổi cổng bằng D1_LOCAL_URL nếu dev server chạy ở cổng khác.
function runLocalSql(sql: string): unknown {
  const base = process.env.D1_LOCAL_URL || "http://localhost:5173"
  const url = `${base}/cdn-cgi/local/explorer/api/d1/database/${getDatabaseId()}/raw`
  const output = execFileSync("curl", ["-sS", "--max-time", "60", "-X", "POST", url, "-H", "content-type: application/json", "--data-binary", "@-"], {
    encoding: "utf8",
    input: JSON.stringify({ sql }),
  })
  const body = JSON.parse(output) as {
    success: boolean
    errors?: Array<{ message: string }>
    result?: Array<{ results?: { columns: string[]; rows: unknown[][] } }>
  }
  if (!body.success) throw new Error(body.errors?.map((error) => error.message).join("; ") || "D1 local lỗi")
  // Đổi về cùng dạng kết quả với `cf d1 query`: mỗi câu lệnh một phần tử { results: object[] }
  return (body.result ?? []).map((item) => ({
    results: (item.results?.rows ?? []).map((row) =>
      Object.fromEntries((item.results?.columns ?? []).map((column, index) => [column, row[index]]))
    ),
  }))
}

/** Chạy một hoặc nhiều câu lệnh SQL (nối bằng dấu chấm phẩy) trên D1 remote, trả về JSON của cf */
export function runSql(sql: string): unknown {
  if (process.env.D1_LOCAL === "1") return runLocalSql(sql)
  const args = [CF_BIN, "d1", "query", getDatabaseId(), "--sql", sql]
  const output = nodeIsRecentEnough()
    ? execFileSync(process.execPath, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] })
    : execFileSync("npx", ["-y", "node@22.21.0", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] })
  return JSON.parse(output)
}

/** Lấy các dòng kết quả của câu SELECT đầu tiên */
export function queryRows<T>(sql: string): T[] {
  const result = runSql(sql) as Array<{ results?: T[] }>
  return result[0]?.results ?? []
}
