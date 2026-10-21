const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/

/** Lấy ID video từ các dạng link YouTube phổ biến */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (YOUTUBE_ID_RE.test(value)) return value

  let url: URL
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "")
  let id: string | null = null

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] || null
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v")
    } else {
      const match = /^\/(embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname)
      id = match?.[2] ?? null
    }
  }

  return id && YOUTUBE_ID_RE.test(id) ? id : null
}

/** URL nhúng chế độ bảo mật nâng cao (không đặt cookie theo dõi trước khi phát) */
export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`
}

export function youTubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/** Chỉ cho phép nhúng bản đồ từ Google Maps */
export function safeMapEmbedUrl(input: string | undefined | null): string | null {
  const value = (input ?? "").trim()
  if (!value) return null
  // Một số người dán nguyên thẻ <iframe ...>, lấy thuộc tính src
  const src = /src=["']([^"']+)["']/i.exec(value)?.[1] ?? value
  try {
    const url = new URL(src)
    const host = url.hostname.replace(/^www\./, "")
    if (url.protocol !== "https:") return null
    if ((host === "google.com" || host.endsWith(".google.com")) && url.pathname.startsWith("/maps")) {
      return url.toString()
    }
    if (host === "maps.google.com") return url.toString()
  } catch {
    return null
  }
  return null
}
