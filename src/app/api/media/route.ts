import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { getCurrentAdminUser, hasPermission, PERMISSIONS } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra"
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentAdminUser()
    if (!hasPermission(user, PERMISSIONS.mediaRead)) {
      return NextResponse.json({ error: "Không có quyền xem media" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const folder = searchParams.get("folder") || undefined
    const search = searchParams.get("search") || undefined
    // page/limit sai (NaN, 0, âm) làm Prisma ném lỗi skip/take → chặn về khoảng hợp lệ
    const rawPage = Number.parseInt(searchParams.get("page") || "1", 10)
    const rawLimit = Number.parseInt(searchParams.get("limit") || "24", 10)
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 24
    const skip = (page - 1) * limit

    const where: Prisma.MediaFileWhereInput = {}
    if (folder) where.folder = folder
    if (search) {
      // LIKE của SQLite đã không phân biệt hoa thường với ký tự ASCII
      where.name = { contains: search }
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mediaFile.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      files,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error: unknown) {
    console.error("[MEDIA_LIST_ERROR]", error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
