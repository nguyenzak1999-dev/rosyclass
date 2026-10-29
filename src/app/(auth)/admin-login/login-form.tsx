"use client"

import * as React from "react"
import { useActionState } from "react"
import { ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"

type LoginState = { error: string | null; email: string }

export function LoginForm({ next }: { next?: string }) {
  const [showPassword, setShowPassword] = React.useState(false)
  // Giữ lại email đã gõ: React tự xoá form sau mỗi lần gửi, nhập sai mật khẩu không nên phải gõ lại email
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    async (_previous, formData) => {
      const result = await login(formData)
      return { error: result?.error ?? null, email: String(formData.get("email") ?? "") }
    },
    { error: null, email: "" }
  )
  const error = state.error

  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoFocus
          defaultValue={state.email}
          required
          placeholder="ten@rosyclass.edu.vn"
          className="h-11 bg-white"
          aria-invalid={error ? true : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Nhập mật khẩu"
            className="h-11 bg-white pr-11"
            aria-invalid={error ? true : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {error ? (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} className="group h-11 w-full rounded-full text-base font-semibold">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang đăng nhập…
          </>
        ) : (
          <>
            Đăng nhập
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
