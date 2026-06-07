import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "24")
    const skip = (page - 1) * limit

    const where: Prisma.MediaFileWhereInput = {}
    if (folder) where.folder = folder
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
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
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
