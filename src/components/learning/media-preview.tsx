import { playableAudioUrl } from "@/lib/curriculum"
import { cn } from "@/lib/utils"

/** Xem trước bài nộp: ảnh, ghi âm hoặc video (dùng chung cho trang quản trị và cổng phụ huynh) */
export function MediaPreview({
  url,
  type,
  alt,
  className,
}: {
  url: string | null
  type: string | null
  alt: string
  className?: string
}) {
  if (!url) return null

  if (type === "audio") {
    const playable = playableAudioUrl(url)
    return (
      <audio controls preload="none" className={cn("w-full", className)}>
        {playable !== url ? <source src={playable} type="audio/mpeg" /> : null}
        <source src={url} />
        <a href={url} target="_blank" rel="noreferrer">
          Mở file ghi âm
        </a>
      </audio>
    )
  }

  if (type === "video") {
    return <video controls preload="metadata" src={url} className={cn("max-h-80 w-full rounded-lg bg-black", className)} />
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className={cn("block", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh Cloudinary do người dùng tải lên, kích thước không biết trước */}
      <img src={url} alt={alt} loading="lazy" className="max-h-80 w-full rounded-lg border object-contain" />
    </a>
  )
}
