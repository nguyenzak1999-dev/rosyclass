import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const folder = searchParams.get("folder") || undefined
    const search = searchParams.get("search") || undefined
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "24")
    const skip = (page - 1) * limit

    const where: any = {}
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
