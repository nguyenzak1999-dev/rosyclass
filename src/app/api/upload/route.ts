import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdminUser, hasPermission, PERMISSIONS } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { deleteStoredImage, storeImage } from "@/lib/media-storage"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra"
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentAdminUser()
    if (!hasPermission(user, PERMISSIONS.mediaWrite)) {
      return NextResponse.json({ error: "Không có quyền tải file" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "Không có file được tải lên" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Chỉ chấp nhận file ảnh" }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File quá lớn, tối đa 10MB" }, { status: 400 })
    }

    const stored = await storeImage(file, folder)

    const media = await prisma.mediaFile.create({
      data: {
        ...stored,
        name: file.name,
        folder,
      }
    })

    return NextResponse.json({ success: true, media })
  } catch (error: unknown) {
    console.error("[UPLOAD_ERROR]", error)
    return NextResponse.json({ error: getErrorMessage(error) || "Có lỗi xảy ra khi tải lên" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentAdminUser()
    if (!hasPermission(user, PERMISSIONS.mediaWrite)) {
      return NextResponse.json({ error: "Không có quyền xóa file" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID file" }, { status: 400 })
    }

    const media = await prisma.mediaFile.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 404 })
    }

    await deleteStoredImage(media)

    // Delete from DB
    await prisma.mediaFile.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[DELETE_ERROR]", error)
    return NextResponse.json({ error: getErrorMessage(error) || "Có lỗi xảy ra khi xóa file" }, { status: 500 })
  }
}
