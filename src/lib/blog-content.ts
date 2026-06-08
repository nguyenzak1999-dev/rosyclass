const blockTags = /<\/?(p|h1|h2|h3|h4|ul|ol|li|blockquote|figure|img|strong|em|a|br)\b/i

export function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\s(href|src)=(["'])\s*javascript:[\s\S]*?\2/gi, "")
}

export function stripBlogHtml(html: string) {
  return sanitizeBlogHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function formatBlogContent(content: string) {
  const value = content.trim()
  if (!value) return ""

  if (blockTags.test(value)) {
    return sanitizeBlogHtml(value)
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
