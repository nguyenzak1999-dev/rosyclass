import { FilterXSS, safeAttrValue } from "xss"

const blockTags = /<\/?(p|h1|h2|h3|h4|ul|ol|li|blockquote|figure|img|strong|em|a|br)\b/i

const BASIC = ["class"]

// Lọc theo danh sách cho phép (không dùng regex): thẻ/thuộc tính ngoài danh sách bị bỏ,
// URL chỉ nhận http(s), mailto, tel và đường dẫn nội bộ
const blogFilter = new FilterXSS({
  whiteList: {
    p: BASIC, br: [], hr: [], span: BASIC, div: BASIC,
    h1: BASIC, h2: BASIC, h3: BASIC, h4: BASIC,
    strong: [], b: [], em: [], i: [], u: [], s: [], mark: [], small: [], sub: [], sup: [],
    ul: BASIC, ol: BASIC, li: BASIC, blockquote: BASIC, pre: BASIC, code: BASIC,
    figure: BASIC, figcaption: BASIC,
    table: BASIC, thead: [], tbody: [], tr: [], th: ["colspan", "rowspan"], td: ["colspan", "rowspan"],
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "noscript", "template"],
  safeAttrValue(tag, name, value, cssFilter) {
    if (name === "href" || name === "src") {
      const url = value.trim()
      const allowed = /^(https?:|mailto:|tel:)/i.test(url) || /^[/#?]/.test(url) || (name === "href" && !/^[a-z][a-z0-9+.-]*:/i.test(url))
      if (!allowed) return ""
    }
    if (tag === "a" && name === "target") return value === "_blank" ? "_blank" : ""
    return safeAttrValue(tag, name, value, cssFilter)
  },
  onTag(tag, html, options) {
    // Link mở tab mới luôn có rel để trang đích không điều khiển được trang blog
    if (tag === "a" && !options.isClosing && /target=["']?_blank/i.test(html) && !/\srel=/i.test(html)) {
      return html.replace(/>$/, ' rel="noopener noreferrer">')
    }
    return undefined
  },
})

export function sanitizeBlogHtml(html: string) {
  return blogFilter.process(html)
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
