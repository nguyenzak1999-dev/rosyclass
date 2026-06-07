"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const adminUser = await prisma.user.findUnique({
    where: {
      email: data.user.email || email,
    },
    select: {
      status: true,
    },
  })

  if (!adminUser || adminUser.status !== "ACTIVE") {
    await supabase.auth.signOut()
    return { error: "Tài khoản chưa được cấp quyền truy cập hệ thống quản trị." }
  }

  revalidatePath("/", "layout")
  redirect("/admin/dashboard")
}
