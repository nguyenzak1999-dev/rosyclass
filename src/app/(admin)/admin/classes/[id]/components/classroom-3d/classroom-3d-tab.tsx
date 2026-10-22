"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { Eye, EyeOff, Maximize2, Minimize2, MonitorUp, School, ScanEye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ClassroomData, ClassroomSeat, SeatAttendance } from "./seats"
import type { CameraPreset } from "./classroom-scene"

// three.js chỉ chạy trên trình duyệt và khá nặng, nên chỉ tải khi mở tab này
const ClassroomScene = dynamic(() => import("./classroom-scene"), {
  ssr: false,
  loading: () => <SceneMessage>Đang dựng phòng học…</SceneMessage>,
})

const LEGEND: Array<{ status: SeatAttendance; label: string; color: string }> = [
  { status: "PRESENT", label: "Có mặt", color: "#2ec4a0" },
  { status: "LATE", label: "Đi muộn", color: "#ff8a3d" },
  { status: "MAKE_UP", label: "Học bù", color: "#3bb4f2" },
  { status: "ABSENT", label: "Vắng", color: "#9aa0a6" },
  { status: "UNKNOWN", label: "Chưa điểm danh", color: "#c9b8ff" },
]

const PRESETS: Array<{ id: CameraPreset; label: string; icon: typeof School }> = [
  { id: "overview", label: "Toàn cảnh", icon: School },
  { id: "teacher", label: "Từ bục giảng", icon: MonitorUp },
  { id: "top", label: "Nhìn từ trên", icon: ScanEye },
]

function SceneMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{children}</div>
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
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

function StudentPanel({ seat, onClose }: { seat: ClassroomSeat; onClose: () => void }) {
  const legend = LEGEND.find((item) => item.status === seat.lastAttendance)!
  return (
    <Card className="absolute right-3 bottom-3 left-3 z-10 sm:left-auto sm:w-80">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold">{seat.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {seat.code ? `Mã ${seat.code}` : "Chưa có mã"}
              {seat.level ? ` · Trình độ ${seat.level}` : ""}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Đóng">
            ✕
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-muted p-2">
            <dt className="text-xs text-muted-foreground">Buổi gần nhất</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: legend.color }} />
              {legend.label}
            </dd>
          </div>
          <div className="rounded-md bg-muted p-2">
            <dt className="text-xs text-muted-foreground">Chuyên cần</dt>
            <dd className="font-medium">
              {seat.attendanceRate === null ? "—" : `${Math.round(seat.attendanceRate * 100)}% (${seat.sessionsRecorded} buổi)`}
            </dd>
          </div>
          <div className="col-span-2 rounded-md bg-muted p-2">
            <dt className="text-xs text-muted-foreground">Điểm trung bình</dt>
            <dd className="font-medium">{seat.averageScore === null ? "Chưa có điểm" : `${seat.averageScore} / 10`}</dd>
          </div>
        </dl>
        <Button size="sm" className="w-full" render={<Link href={`/admin/students/${seat.studentId}`} />}>
          Xem hồ sơ học viên
        </Button>
      </CardContent>
    </Card>
  )
}

export function Classroom3DTab({ classroom }: { classroom: ClassroomData }) {
  const [showNames, setShowNames] = useState(true)
  const [preset, setPreset] = useState<CameraPreset>("overview")
  const [selected, setSelected] = useState<ClassroomSeat | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  // null khi render ở server; trên trình duyệt mới kiểm tra được WebGL
  const webgl = useSyncExternalStore<boolean | null>(noopSubscribe, hasWebGL, () => null)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setFullscreen(false)
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [fullscreen])

  const counts = useMemo(() => {
    const result = Object.fromEntries(LEGEND.map((item) => [item.status, 0])) as Record<SeatAttendance, number>
    for (const seat of classroom.seats) result[seat.lastAttendance]++
    return result
  }, [classroom.seats])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(({ id, label, icon: Icon }) => (
            <Button key={id} size="sm" variant={preset === id ? "default" : "outline"} onClick={() => setPreset(id)}>
              <Icon /> {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setShowNames((value) => !value)} aria-pressed={showNames}>
            {showNames ? <EyeOff /> : <Eye />} {showNames ? "Ẩn tên" : "Hiện tên"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFullscreen((value) => !value)} aria-pressed={fullscreen}>
            {fullscreen ? <Minimize2 /> : <Maximize2 />} {fullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-[#fff8ec]",
          fullscreen ? "fixed inset-0 z-50 rounded-none border-0" : "h-[560px]"
        )}
      >
        {webgl === false ? (
          <SceneMessage>Trình duyệt này không hỗ trợ WebGL nên không hiển thị được lớp học 3D.</SceneMessage>
        ) : webgl ? (
          <ClassroomScene
            classroom={classroom}
            showNames={showNames}
            preset={preset}
            selectedId={selected?.studentId ?? null}
            onSelect={setSelected}
            reducedMotion={reducedMotion}
          />
        ) : null}

        {classroom.seats.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-4 text-center">
            <span className="rounded-full bg-background/90 px-4 py-1.5 text-sm shadow">Lớp chưa có học viên nào</span>
          </div>
        ) : null}

        {fullscreen ? (
          <Button size="sm" variant="outline" className="absolute top-3 right-3 z-10" onClick={() => setFullscreen(false)}>
            <Minimize2 /> Thoát (Esc)
          </Button>
        ) : null}

        {selected ? <StudentPanel seat={selected} onClose={() => setSelected(null)} /> : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.status} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
            {item.label}: <strong className="text-foreground">{counts[item.status]}</strong>
          </span>
        ))}
        <span className="ml-auto text-xs">Kéo để xoay · cuộn để phóng to · bấm vào bàn để xem học viên</span>
      </div>
    </div>
  )
}
