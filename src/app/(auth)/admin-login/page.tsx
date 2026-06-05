"use client"

import * as React from "react"
import { useActionState } from "react"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldAlert, ArrowRight, BookOpen } from "lucide-react"

export default function LoginPage() {
  const [error, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(formData)
      if (result?.error) {
        return result.error
      }
      return null
    },
    null
  )

  return (
    <div className="w-full max-w-md px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 bg-[#25d366]/10 text-[#25d366] rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111b21]">RosyClass</h1>
        <p className="text-[#111b21]/60 mt-2">Hệ thống quản lý Học thuật & CRM</p>
      </div>

      <Card className="border-none shadow-xl bg-white/70 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-xl font-semibold">Đăng nhập Quản trị viên</CardTitle>
          <CardDescription>
            Vui lòng nhập thông tin xác thực để truy cập hệ thống.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Địa chỉ Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Ví dụ: admin@rosyclass.edu.vn"
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-medium">Mật khẩu</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Nhập mật khẩu của bạn"
                required 
                className="bg-white"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <ShieldAlert className="h-4 w-4" />
                <p>{error === "Invalid login credentials" ? "Email hoặc mật khẩu không chính xác." : error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-6">
            <Button 
              className="w-full h-11 text-base font-medium rounded-full bg-[#111b21] hover:bg-[#111b21]/90 text-[#fcf5eb] group" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? "Đang xác thực..." : (
                <span className="flex items-center">
                  Đăng nhập <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="text-center mt-8 text-sm text-[#111b21]/50">
        <p>&copy; {new Date().getFullYear()} RosyClass Education.</p>
        <p>Phiên bản hệ thống 1.0.0</p>
      </div>
    </div>
  )
}
