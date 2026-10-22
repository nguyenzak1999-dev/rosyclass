"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Camera, Mic, Square, Upload, X } from "lucide-react"
import { KidButton } from "@/components/kids"
import { HOMEWORK_MAX_BYTES } from "@/lib/curriculum"
import { cn } from "@/lib/utils"

const MAX_RECORDING_SECONDS = 180
const MAX_IMAGE_SIDE = 1600

type Picked = { file: File; kind: "image" | "audio"; previewUrl: string }

/** Thu nhỏ ảnh chụp từ điện thoại (thường 3–8 MB) trước khi gửi; lỗi thì gửi ảnh gốc */
async function shrinkImage(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024 || typeof createImageBitmap !== "function") return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined") return null
  for (const type of ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ""
}

export function HomeworkSubmitForm({
  homeworkId,
  studentId,
  kind,
  hasSubmission,
  uploadsEnabled,
}: {
  homeworkId: string
  studentId: string
  kind: string
  hasSubmission: boolean
  uploadsEnabled: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<Picked | null>(null)
  const [note, setNote] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const timerRef = React.useRef<number | null>(null)
  const photoInput = React.useRef<HTMLInputElement>(null)
  const audioInput = React.useRef<HTMLInputElement>(null)
  const prefersAudio = kind === "SPEAKING" || kind === "LISTENING"
  const canRecord = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && pickRecorderMime() !== null

  const replacePicked = React.useCallback((next: Picked | null) => {
    setPicked((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl)
      return next
    })
  }, [])

  React.useEffect(
    () => () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
      if (timerRef.current) window.clearInterval(timerRef.current)
    },
    []
  )

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>, kindOfFile: "image" | "audio") => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError(null)
    const ready = kindOfFile === "image" ? await shrinkImage(file) : file
    if (ready.size > HOMEWORK_MAX_BYTES) {
      setError("File lớn quá 15 MB. Ba mẹ chọn file nhỏ hơn hoặc ghi âm ngắn hơn giúp con nhé.")
      return
    }
    replacePicked({ file: ready, kind: kindOfFile, previewUrl: URL.createObjectURL(ready) })
  }

  const stopRecording = React.useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop()
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    setRecording(false)
  }, [])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickRecorderMime() || undefined
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const type = recorder.mimeType || "audio/webm"
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm"
        const file = new File([new Blob(chunks, { type })], `ghi-am.${extension}`, { type: type.split(";")[0] })
        replacePicked({ file, kind: "audio", previewUrl: URL.createObjectURL(file) })
      }
      recorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setRecording(true)
      const startedAt = Date.now()
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        setSeconds(elapsed)
        // Tự dừng khi ghi đủ 3 phút
        if (elapsed >= MAX_RECORDING_SECONDS) stopRecording()
      }, 1000)
    } catch {
      setError("Chưa mở được micro. Ba mẹ cho phép trình duyệt dùng micro, hoặc chọn file ghi âm có sẵn nhé.")
    }
  }

  const submit = async () => {
    if (!picked && !note.trim()) {
      setError("Ba mẹ chọn ảnh, ghi âm hoặc viết vài dòng cho cô nhé.")
      return
    }
    setSending(true)
    setError(null)
    const body = new FormData()
    body.set("homeworkId", homeworkId)
    body.set("studentId", studentId)
    body.set("note", note.trim())
    if (picked) body.set("file", picked.file)
    try {
      const response = await fetch("/api/parent/upload", { method: "POST", body })
      const result = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setError(result.error || "Chưa gửi được bài. Ba mẹ thử lại sau ít phút nhé.")
        return
      }
      replacePicked(null)
      setNote("")
      setOpen(false)
      setDone(true)
      router.refresh()
    } catch {
      setError("Mạng đang chập chờn nên chưa gửi được. Ba mẹ thử lại nhé.")
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <KidButton tone={hasSubmission ? "white" : "sun"} size="sm" onClick={() => setOpen(true)}>
          <Upload className="h-4 w-4" /> {hasSubmission ? "Gửi lại bài" : "Nộp bài cho cô"}
        </KidButton>
        {done ? (
          <p className="text-[15px] font-bold" role="status">
            Đã gửi bài cho cô! 🎉
          </p>
        ) : null}
      </div>
    )
  }

  const mediaButtons = [
    <button
      key="photo"
      type="button"
      disabled={!uploadsEnabled || recording}
      onClick={() => photoInput.current?.click()}
      className="kid-focus inline-flex min-h-12 items-center gap-2 rounded-2xl border-[3px] border-kid-ink bg-kid-sky-soft px-4 font-bold disabled:opacity-50"
    >
      <Camera className="h-5 w-5" /> Chụp / chọn ảnh
    </button>,
    canRecord ? (
      <button
        key="record"
        type="button"
        disabled={!uploadsEnabled}
        onClick={recording ? stopRecording : startRecording}
        className={cn(
          "kid-focus inline-flex min-h-12 items-center gap-2 rounded-2xl border-[3px] border-kid-ink px-4 font-bold disabled:opacity-50",
          recording ? "bg-kid-rose text-kid-ink" : "bg-kid-mint-soft"
        )}
      >
        {recording ? (
          <>
            <Square className="h-5 w-5" /> Dừng ({Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")})
            <span className="h-2.5 w-2.5 rounded-full bg-kid-ink motion-safe:animate-pulse" aria-hidden="true" />
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" /> Ghi âm
          </>
        )}
      </button>
    ) : null,
    <button
      key="audio-file"
      type="button"
      disabled={!uploadsEnabled || recording}
      onClick={() => audioInput.current?.click()}
      className="kid-focus inline-flex min-h-12 items-center gap-2 rounded-2xl border-[3px] border-kid-ink bg-white px-4 font-bold disabled:opacity-50"
    >
      <Upload className="h-5 w-5" /> File ghi âm
    </button>,
  ]

  return (
    <div className="space-y-3 rounded-2xl border-[3px] border-kid-ink bg-kid-cream p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-kid-display text-lg font-extrabold">Nộp bài cho cô</p>
        <button
          type="button"
          onClick={() => {
            if (recording) stopRecording()
            replacePicked(null)
            setOpen(false)
          }}
          aria-label="Đóng"
          className="kid-focus flex h-10 w-10 items-center justify-center rounded-full border-2 border-kid-ink bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!uploadsEnabled ? (
        <p className="rounded-xl bg-kid-sun-soft p-3 text-[15px]">
          Chưa cấu hình kho ảnh nên tạm thời chưa gửi được ảnh hoặc ghi âm. Ba mẹ có thể viết lời nhắn cho cô, hoặc gửi bài qua Zalo
          của trung tâm nhé.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">{prefersAudio ? [mediaButtons[1], mediaButtons[2], mediaButtons[0]] : mediaButtons}</div>
      <input ref={photoInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(event) => onFile(event, "image")} />
      <input ref={audioInput} type="file" accept="audio/*" className="sr-only" tabIndex={-1} onChange={(event) => onFile(event, "audio")} />

      {picked ? (
        <div className="space-y-2 rounded-xl bg-white p-3">
          {picked.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước từ máy (blob:)
            <img src={picked.previewUrl} alt="Ảnh bài làm của bé" className="max-h-64 w-full rounded-lg object-contain" />
          ) : (
            <audio controls src={picked.previewUrl} className="w-full" />
          )}
          <button type="button" onClick={() => replacePicked(null)} className="text-sm font-bold text-kid-ink-soft underline">
            Bỏ file này
          </button>
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-[15px] font-bold">Lời nhắn cho cô (tuỳ chọn)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Hôm nay con tự tô màu hết bức tranh ạ!"
          className="kid-field min-h-[72px] w-full resize-y p-3"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-kid-rose-soft p-3 text-[15px] font-semibold" role="alert">
          {error}
        </p>
      ) : null}

      <KidButton tone="rose" onClick={submit} disabled={sending || recording}>
        {sending ? "Đang gửi…" : "Gửi bài"}
      </KidButton>
    </div>
  )
}
