import * as z from "zod"
import { coerceObject, objectSchemaFromFields } from "./fields"
import { PAGE_DOCUMENT_VERSION } from "./constants"
import {
  BLOCK_DEFINITIONS,
  BLOCK_TYPES,
  getBlockDefinition,
  isBlockType,
  type BlockProps,
  type BlockType,
} from "./registry"

export type Block<T extends BlockType = BlockType> = {
  [K in T]: { id: string; type: K; props: BlockProps<K>; hidden?: boolean }
}[T]

export interface PageDocument {
  version: typeof PAGE_DOCUMENT_VERSION
  blocks: Block[]
  /**
   * Bản nháp chưa xuất bản của một trang đang hiển thị công khai.
   * Trang công khai luôn render `blocks`; builder mở `draft` nếu có.
   */
  draft?: { blocks: Block[]; savedAt: string }
}

export const MAX_BLOCKS = 80

// ---------------------------------------------------------------------------
// Tạo block
// ---------------------------------------------------------------------------

export function createBlockId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `b_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`
  }
  return `b_${Math.random().toString(36).slice(2, 14)}`
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createBlock<T extends BlockType>(type: T, props?: Partial<BlockProps<T>>): Block<T> {
  const defaults = cloneValue(BLOCK_DEFINITIONS[type].defaults) as BlockProps<T>
  return { id: createBlockId(), type, props: { ...defaults, ...props } } as Block<T>
}

export function duplicateBlock(block: Block): Block {
  return { ...cloneValue(block), id: createBlockId() }
}

export function emptyDocument(): PageDocument {
  return { version: PAGE_DOCUMENT_VERSION, blocks: [] }
}

// ---------------------------------------------------------------------------
// Đọc an toàn: block hỏng/không rõ loại bị bỏ, props thiếu lấy từ mặc định
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/

export function normalizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const blocks: Block[] = []

  for (const item of raw) {
    if (blocks.length >= MAX_BLOCKS) break
    if (!isRecord(item) || !isBlockType(item.type)) continue

    let id = typeof item.id === "string" && ID_RE.test(item.id) ? item.id : createBlockId()
    if (seen.has(id)) id = createBlockId()
    seen.add(id)

    const definition = getBlockDefinition(item.type)
    const props = coerceObject(definition.fields, item.props, definition.defaults)
    const block = { id, type: item.type, props } as Block
    if (item.hidden === true) block.hidden = true
    blocks.push(block)
  }

  return blocks
}

/**
 * Parse Page.content thành PageDocument.
 * - JSON hợp lệ dạng { blocks: [...] } → chuẩn hoá từng block
 * - Nội dung cũ (HTML/văn bản thường) → chuyển thành một khối "Văn bản"
 * - Rỗng/hỏng → tài liệu rỗng
 */
export function parsePageDocument(content: string | null | undefined): PageDocument {
  const value = (content ?? "").trim()
  if (!value) return emptyDocument()

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return {
      version: PAGE_DOCUMENT_VERSION,
      blocks: [createBlock("richText", { content: legacyContentToMarkdown(value) })],
    }
  }

  if (Array.isArray(parsed)) {
    return { version: PAGE_DOCUMENT_VERSION, blocks: normalizeBlocks(parsed) }
  }

  if (!isRecord(parsed)) return emptyDocument()

  const doc: PageDocument = { version: PAGE_DOCUMENT_VERSION, blocks: normalizeBlocks(parsed.blocks) }

  if (isRecord(parsed.draft) && Array.isArray(parsed.draft.blocks)) {
    doc.draft = {
      blocks: normalizeBlocks(parsed.draft.blocks),
      savedAt: typeof parsed.draft.savedAt === "string" ? parsed.draft.savedAt : new Date(0).toISOString(),
    }
  }

  return doc
}

const LEGACY_MAX_LENGTH = 20000

/** Chuyển nội dung cũ (HTML đơn giản hoặc văn bản) sang Markdown tối giản cho khối "Văn bản" */
export function legacyContentToMarkdown(value: string): string {
  if (!/<[a-z][\s\S]*>/i.test(value)) return value.slice(0, LEGACY_MAX_LENGTH)

  const markdown = value
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n## $1\n\n")
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|ul|ol|blockquote|section|article)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return markdown.slice(0, LEGACY_MAX_LENGTH)
}

export function serializePageDocument(doc: PageDocument): string {
  const output: PageDocument = { version: PAGE_DOCUMENT_VERSION, blocks: doc.blocks }
  if (doc.draft) output.draft = doc.draft
  return JSON.stringify(output)
}

/** Nội dung có phải là tài liệu page builder (JSON) hay không */
export function isBuilderContent(content: string | null | undefined) {
  const value = (content ?? "").trim()
  if (!value.startsWith("{")) return false
  try {
    const parsed = JSON.parse(value)
    return isRecord(parsed) && Array.isArray(parsed.blocks)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Validate nghiêm ngặt khi lưu
// ---------------------------------------------------------------------------

const propSchemas = Object.fromEntries(
  BLOCK_TYPES.map((type) => [type, objectSchemaFromFields(getBlockDefinition(type).fields)])
) as unknown as Record<BlockType, z.ZodType>

const blockEnvelopeSchema = z.object({
  id: z.string().regex(ID_RE, "ID khối không hợp lệ"),
  type: z.enum(BLOCK_TYPES as [BlockType, ...BlockType[]]),
  hidden: z.boolean().optional(),
  props: z.unknown(),
})

const blocksEnvelopeSchema = z.array(blockEnvelopeSchema).max(MAX_BLOCKS, `Tối đa ${MAX_BLOCKS} khối trên một trang`)

/**
 * Validate danh sách block trước khi lưu. Trả về block đã được làm sạch
 * (props chỉ giữ các field khai báo trong registry).
 */
export function validateBlocks(input: unknown): { success: true; blocks: Block[] } | { success: false; error: string } {
  const envelope = blocksEnvelopeSchema.safeParse(input)
  if (!envelope.success) {
    return { success: false, error: envelope.error.issues[0]?.message || "Dữ liệu khối không hợp lệ" }
  }

  const ids = new Set<string>()
  const blocks: Block[] = []

  for (const [index, item] of envelope.data.entries()) {
    if (ids.has(item.id)) return { success: false, error: `Khối #${index + 1}: ID bị trùng` }
    ids.add(item.id)

    const result = propSchemas[item.type].safeParse(item.props)
    if (!result.success) {
      const issue = result.error.issues[0]
      return {
        success: false,
        error: `Khối #${index + 1} (${BLOCK_DEFINITIONS[item.type].label}): ${issue?.message || "dữ liệu không hợp lệ"}`,
      }
    }

    const block = { id: item.id, type: item.type, props: result.data } as Block
    if (item.hidden) block.hidden = true
    blocks.push(block)
  }

  return { success: true, blocks }
}

/** Chỉ các block đang hiển thị */
export function visibleBlocks(blocks: Block[]) {
  return blocks.filter((block) => !block.hidden)
}
