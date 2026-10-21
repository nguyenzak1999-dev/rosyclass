import { isSafeLink } from "./fields"

/**
 * Markdown tối giản → HTML an toàn.
 * Toàn bộ văn bản được escape trước, sau đó mới chèn các thẻ được phép,
 * nên không có HTML nào do người dùng nhập lọt ra ngoài.
 *
 * Hỗ trợ: # / ## / ### tiêu đề, đoạn văn, xuống dòng, **đậm**, *nghiêng*,
 * `code`, [liên kết](url), - / * danh sách, 1. danh sách số, > trích dẫn, --- kẻ ngang.
 */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderInline(text: string) {
  let html = escapeHtml(text)

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) => {
    const decoded = url.replace(/&amp;/g, "&")
    if (!isSafeLink(decoded) || decoded === "") return label
    const external = /^https?:\/\//i.test(decoded)
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`
  })

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")

  return html
}

const HEADING_RE = /^(#{1,3})\s+(.+)$/
const UL_RE = /^\s*[-*+]\s+(.+)$/
const OL_RE = /^\s*\d+[.)]\s+(.+)$/
const QUOTE_RE = /^>\s?(.*)$/
const HR_RE = /^(-{3,}|\*{3,})\s*$/

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n")
  const output: string[] = []
  let paragraph: string[] = []
  let list: { type: "ul" | "ol"; items: string[] } | null = null
  let quote: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${paragraph.map(renderInline).join("<br />")}</p>`)
      paragraph = []
    }
  }
  const flushList = () => {
    if (list) {
      output.push(`<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${list.type}>`)
      list = null
    }
  }
  const flushQuote = () => {
    if (quote.length) {
      output.push(`<blockquote><p>${quote.map(renderInline).join("<br />")}</p></blockquote>`)
      quote = []
    }
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
    flushQuote()
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (!line.trim()) {
      flushAll()
      continue
    }

    if (HR_RE.test(line.trim())) {
      flushAll()
      output.push("<hr />")
      continue
    }

    const heading = HEADING_RE.exec(line.trim())
    if (heading) {
      flushAll()
      // # → h2 vì h1 thuộc về tiêu đề trang (thường nằm ở hero)
      const level = heading[1].length + 1
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }

    const quoteMatch = QUOTE_RE.exec(line.trim())
    if (quoteMatch) {
      flushParagraph()
      flushList()
      quote.push(quoteMatch[1])
      continue
    }

    const ul = UL_RE.exec(line)
    const ol = ul ? null : OL_RE.exec(line)
    if (ul || ol) {
      flushParagraph()
      flushQuote()
      const type = ul ? "ul" : "ol"
      const currentList = list as { type: "ul" | "ol"; items: string[] } | null
      if (!currentList || currentList.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list!.items.push((ul || ol)![1])
      continue
    }

    flushList()
    flushQuote()
    paragraph.push(line.trim())
  }

  flushAll()
  return output.join("")
}
