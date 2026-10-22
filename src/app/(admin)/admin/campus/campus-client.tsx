"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { ArrowRight, Box, LayoutGrid, Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { BuildingId, CampusBuilding } from "./buildings"

// three.js chỉ chạy trên trình duyệt; tải riêng để trang không nặng khi chỉ dùng danh sách
const CampusScene = dynamic(() => import("./campus-scene"), {
  ssr: false,
  loading: () => <Centered>Đang dựng khuôn viên…</Centered>,
})

const VIEW_KEY = "campus-view"
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">{children}</div>
}

const noopSubscribe = () => () => {}

let webglSupport: boolean | undefined
function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement("canvas")
    webglSupport = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

function readStoredView(): "3d" | "list" {
  try {
    return window.localStorage.getItem(VIEW_KEY) === "list" ? "list" : "3d"
  } catch {
    return "3d"
  }
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function greeting() {
  // Giờ Việt Nam, kể cả khi máy người dùng đặt múi giờ khác
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()))
  if (hour < 11) return "Chào buổi sáng"
  if (hour < 14) return "Chào buổi trưa"
  if (hour < 18) return "Chào buổi chiều"
  return "Chào buổi tối"
}

function BuildingPanel({ building, onClose }: { building: CampusBuilding; onClose: () => void }) {
  return (
    <Card className="absolute right-3 bottom-3 left-3 z-10 sm:top-3 sm:bottom-auto sm:left-auto sm:w-80">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0 rounded" style={{ background: building.roof }} />
            <h2 className="text-lg font-semibold">{building.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
            <X />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{building.description}</p>
        {building.stat ? (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-3xl font-bold">{building.stat.value}</p>
            <p className="text-sm text-muted-foreground">{building.stat.label}</p>
          </div>
        ) : null}
        {building.links.length > 1 ? (
          <nav className="grid gap-1" aria-label={`Các mục trong ${building.name}`}>
            {building.links.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                {link.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        ) : null}
        <Button className="w-full" render={<Link href={building.href} />}>
          Vào {building.name.toLowerCase()} <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  )
}

function BuildingGrid({ buildings }: { buildings: CampusBuilding[] }) {
  return (
    <div className="grid gap-3 p-1 sm:grid-cols-2 lg:grid-cols-3">
      {buildings.map((building) => (
        <Card key={building.id} className="overflow-hidden">
          <div className="h-2" style={{ background: building.roof }} />
          <CardContent className="space-y-3 p-4">
            <div>
              <h2 className="font-semibold">{building.name}</h2>
              <p className="text-sm text-muted-foreground">{building.description}</p>
            </div>
            {building.stat ? (
              <p className="text-sm">
                <strong className="text-2xl">{building.stat.value}</strong> {building.stat.label}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {building.links.map((link) => (
                <Button key={link.href} size="sm" variant="outline" render={<Link href={link.href} />}>
                  {link.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function CampusClient({ userName, buildings }: { userName: string; buildings: CampusBuilding[] }) {
  const [focusedId, setFocusedId] = useState<BuildingId | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const storedView = useSyncExternalStore(noopSubscribe, readStoredView, () => "3d" as const)
  const [chosenView, setChosenView] = useState<"3d" | "list" | null>(null)
  const view = chosenView ?? storedView
  const webgl = useSyncExternalStore<boolean | null>(noopSubscribe, hasWebGL, () => null)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )
  const hello = useSyncExternalStore(noopSubscribe, greeting, () => "Xin chào")

  const focused = useMemo(() => buildings.find((building) => building.id === focusedId) ?? null, [buildings, focusedId])
  const showScene = view === "3d" && webgl !== false

  const changeView = (next: "3d" | "list") => {
    setChosenView(next)
    setFocusedId(null)
    try {
      window.localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Trình duyệt chặn lưu trữ thì chỉ không nhớ lựa chọn
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (focusedId) setFocusedId(null)
      else if (fullscreen) setFullscreen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [focusedId, fullscreen])

  if (buildings.length === 0) {
    return <Centered>Tài khoản của bạn chưa được cấp quyền vào khu vực nào. Hãy liên hệ quản trị viên.</Centered>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {hello}, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {showScene ? "Bấm vào một toà nhà trong khuôn viên để bắt đầu làm việc." : "Chọn khu vực bạn muốn làm việc."}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant={view === "3d" ? "default" : "outline"} onClick={() => changeView("3d")} aria-pressed={view === "3d"}>
            <Box /> Khuôn viên 3D
          </Button>
          <Button size="sm" variant={view === "list" ? "default" : "outline"} onClick={() => changeView("list")} aria-pressed={view === "list"}>
            <LayoutGrid /> Danh sách
          </Button>
        </div>
      </div>

      {showScene ? (
        <>
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border bg-[#cdeeff]",
              fullscreen ? "fixed inset-0 z-50 rounded-none border-0" : "h-[calc(100svh-15rem)] min-h-[460px]"
            )}
          >
            {webgl ? (
              <CampusScene buildings={buildings} focusedId={focusedId} onSelect={setFocusedId} reducedMotion={reducedMotion} />
            ) : null}

            <Button
              size="sm"
              variant="outline"
              className="absolute top-3 left-3 z-10 bg-background/90"
              onClick={() => setFullscreen((value) => !value)}
              aria-pressed={fullscreen}
            >
              {fullscreen ? <Minimize2 /> : <Maximize2 />} {fullscreen ? "Thu nhỏ (Esc)" : "Toàn màn hình"}
            </Button>
            {focusedId ? (
              <Button size="sm" variant="outline" className="absolute top-12 left-3 z-10 bg-background/90" onClick={() => setFocusedId(null)}>
                ← Về toàn cảnh
              </Button>
            ) : null}

            {focused ? <BuildingPanel building={focused} onClose={() => setFocusedId(null)} /> : null}
          </div>

          {/* Lối đi nhanh bằng bàn phím, cũng là chú giải cho khuôn viên */}
          <nav aria-label="Đi nhanh tới khu vực" className="flex flex-wrap gap-1.5">
            {buildings.map((building) => (
              <Button
                key={building.id}
                size="sm"
                variant={focusedId === building.id ? "default" : "outline"}
                onClick={() => setFocusedId(building.id)}
                aria-pressed={focusedId === building.id}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: building.roof }} />
                {building.name}
                {building.stat ? <span className="text-muted-foreground">· {building.stat.value}</span> : null}
              </Button>
            ))}
          </nav>
        </>
      ) : (
        <>
          {view === "3d" && webgl === false ? (
            <p className="text-sm text-muted-foreground">Trình duyệt này không hỗ trợ WebGL nên hiển thị dạng danh sách.</p>
          ) : null}
          <BuildingGrid buildings={buildings} />
        </>
      )}
    </div>
  )
}
