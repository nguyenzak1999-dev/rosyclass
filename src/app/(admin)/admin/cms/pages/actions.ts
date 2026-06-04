"use server"

import { prisma } from "@/lib/prisma"
import { pageSchema, type PageFormValues } from "@/lib/schemas/page"
import { revalidatePath } from "next/cache"

export async function upsertPage(data: PageFormValues) {
  try {
    const parsedData = pageSchema.parse(data)
    
    if (parsedData.id) {
      await prisma.page.update({
        where: { id: parsedData.id },
        data: { ...parsedData, content: parsedData.content || "" }
      })
    } else {
      await prisma.page.create({
        data: { ...parsedData, content: parsedData.content || "" }
      })
    }

    revalidatePath("/admin/cms/pages")
    return { success: true }
  } catch (error: unknown) {
    console.error("Page upsert error:", error)
    if ((error as any).code === 'P2002') {
       return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    }
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({ where: { id } })
    revalidatePath("/admin/cms/pages")
    return { success: true }
  } catch (error: unknown) {
    console.error("Page delete error:", error)
    return { success: false, error: "Không thể xóa trang này" }
  }
}
