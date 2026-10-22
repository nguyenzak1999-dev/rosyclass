"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PARENT_COOKIE } from "@/lib/auth/parent-session"

export async function logoutParent() {
  const cookieStore = await cookies()
  cookieStore.delete(PARENT_COOKIE)
  redirect("/phu-huynh?da-dang-xuat=1")
}
