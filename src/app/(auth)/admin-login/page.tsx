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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary font-bold">RosyClass</CardTitle>
        <CardDescription>
          Đăng nhập vào hệ thống quản lý trung tâm.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@rosyclass.edu.vn"
              required
              defaultValue="admin@rosyclass.edu.vn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              defaultValue="admin123" 
            />
          </div>
          {error && (
            <div className="text-sm text-destructive font-medium">{error}</div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
