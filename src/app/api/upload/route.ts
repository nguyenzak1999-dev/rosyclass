import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getCurrentAdminUser, hasPermission, PERMISSIONS } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra"
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: `rosyclass/${folder}`,
      resource_type: "image",
      transformation: [
        { quality: "auto:good", fetch_format: "auto" }
      ],
    })

    // Save to DB
    const media = await prisma.mediaFile.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        name: file.name,
        folder,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
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

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId)

    // Delete from DB
    await prisma.mediaFile.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[DELETE_ERROR]", error)
    return NextResponse.json({ error: getErrorMessage(error) || "Có lỗi xảy ra khi xóa file" }, { status: 500 })
  }
}
