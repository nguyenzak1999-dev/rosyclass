"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { youTubeEmbedUrl, youTubeThumbnailUrl } from "@/lib/page-builder/video"

/**
 * Nhúng YouTube kiểu "facade": chỉ tải iframe (youtube-nocookie) khi người xem bấm phát,
 * giúp trang nhẹ hơn và không gửi dữ liệu cho YouTube trước khi người xem đồng ý.
 */
export function YouTubeFacade({ videoId, title, poster }: { videoId: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        src={youTubeEmbedUrl(videoId)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 flex h-full w-full items-center justify-center focus-visible:outline-none"
      aria-label={`Phát video: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster || youTubeThumbnailUrl(videoId)}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-kid-ink/20 transition-colors group-hover:bg-kid-ink/10" aria-hidden="true" />
      <span className="kid-border kid-shadow relative flex h-20 w-20 items-center justify-center rounded-full bg-kid-rose text-white transition-transform group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-kid-sun">
        <Play className="ml-1 h-9 w-9 fill-white" aria-hidden="true" />
      </span>
    </button>
  )
}
