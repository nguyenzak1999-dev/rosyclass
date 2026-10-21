import * as z from "zod"

/**
 * Field schema khai báo cho page builder.
 * Mỗi field vừa mô tả cách hiển thị trong inspector (kind, label, ...),
 * vừa mang theo zod schema để validate khi lưu và "sửa" dữ liệu hỏng khi đọc.
 * Kiểu giá trị được giữ trong thuộc tính ảo `__value` để suy ra kiểu props của block.
 */

interface FieldBase<K extends string, T> {
  kind: K
  label: string
  help?: string
  schema: z.ZodType
  /** Chỉ dùng cho suy luận kiểu, không tồn tại lúc chạy */
  readonly __value?: T
}

export interface TextField extends FieldBase<"text", string> {
  placeholder?: string
}

export interface TextareaField extends FieldBase<"textarea", string> {
  placeholder?: string
  rows?: number
}

export interface MarkdownField extends FieldBase<"markdown", string> {
  rows?: number
}

export interface ImageField extends FieldBase<"image", string> {
  aspectRatio?: string
  folder?: string
}

export interface LinkField extends FieldBase<"link", string> {
  placeholder?: string
}

export interface SelectOption<V extends string = string> {
  value: V
  label: string
}

export interface SelectField<V extends string = string> extends FieldBase<"select", V> {
  options: readonly SelectOption<V>[]
}

export interface ToneField<V extends string = string> extends FieldBase<"tone", V> {
  options: readonly V[]
  /** "tone": màu đậm của kid tone; "background": màu nền nhạt */
  palette: "tone" | "background"
}

export interface NumberField extends FieldBase<"number", number> {
  min: number
  max: number
  step?: number
}

export type BooleanField = FieldBase<"boolean", boolean>

export interface ListField<I extends Record<string, unknown> = Record<string, unknown>> extends FieldBase<"list", I[]> {
  fields: FieldMap
  itemLabel: string
  /** Khoá của sub-field dùng làm tiêu đề cho mỗi item trong inspector */
  titleKey?: string
  minItems: number
  maxItems: number
  newItem: I
}

export type AnyField =
  | TextField
  | TextareaField
  | MarkdownField
  | ImageField
  | LinkField
  | SelectField
  | ToneField
  | NumberField
  | BooleanField
  | ListField

export type FieldKind = AnyField["kind"]

export type FieldMap = Record<string, AnyField>

export type ValueOf<F> = F extends { readonly __value?: infer T } ? Exclude<T, undefined> : never

export type PropsOf<M extends FieldMap> = { [K in keyof M]: ValueOf<M[K]> }

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const DEFAULT_TEXT_MAX = 300
const DEFAULT_TEXTAREA_MAX = 2000

// Link: cho phép đường dẫn nội bộ, neo, http(s), mailto, tel. Chặn javascript: và các scheme lạ.
const SAFE_LINK_RE = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i

export function isSafeLink(value: string) {
  return value === "" || SAFE_LINK_RE.test(value.trim())
}

// Ảnh: đường dẫn nội bộ hoặc https/http
const SAFE_IMAGE_RE = /^(\/(?!\/)|https?:\/\/)/i

export function isSafeImage(value: string) {
  return value === "" || SAFE_IMAGE_RE.test(value.trim())
}

type CommonOpts = { help?: string }

export const f = {
  text(label: string, opts: CommonOpts & { placeholder?: string; max?: number } = {}): TextField {
    return {
      kind: "text",
      label,
      help: opts.help,
      placeholder: opts.placeholder,
      schema: z.string().max(opts.max ?? DEFAULT_TEXT_MAX, `${label}: tối đa ${opts.max ?? DEFAULT_TEXT_MAX} ký tự`),
    }
  },

  textarea(label: string, opts: CommonOpts & { placeholder?: string; rows?: number; max?: number } = {}): TextareaField {
    return {
      kind: "textarea",
      label,
      help: opts.help,
      placeholder: opts.placeholder,
      rows: opts.rows,
      schema: z
        .string()
        .max(opts.max ?? DEFAULT_TEXTAREA_MAX, `${label}: tối đa ${opts.max ?? DEFAULT_TEXTAREA_MAX} ký tự`),
    }
  },

  markdown(label: string, opts: CommonOpts & { rows?: number; max?: number } = {}): MarkdownField {
    return {
      kind: "markdown",
      label,
      help: opts.help,
      rows: opts.rows,
      schema: z.string().max(opts.max ?? 20000, `${label}: nội dung quá dài`),
    }
  },

  image(label: string, opts: CommonOpts & { aspectRatio?: string; folder?: string } = {}): ImageField {
    return {
      kind: "image",
      label,
      help: opts.help,
      aspectRatio: opts.aspectRatio,
      folder: opts.folder,
      schema: z.string().max(1000).refine(isSafeImage, `${label}: đường dẫn ảnh không hợp lệ`),
    }
  },

  link(label: string, opts: CommonOpts & { placeholder?: string } = {}): LinkField {
    return {
      kind: "link",
      label,
      help: opts.help,
      placeholder: opts.placeholder ?? "/dang-ky hoặc https://...",
      schema: z
        .string()
        .max(1000)
        .refine(isSafeLink, `${label}: chỉ chấp nhận /đường-dẫn, #neo, https://, mailto: hoặc tel:`),
    }
  },

  select<const V extends string>(label: string, options: readonly SelectOption<V>[], opts: CommonOpts = {}): SelectField<V> {
    const values = options.map((option) => option.value) as [V, ...V[]]
    return { kind: "select", label, help: opts.help, options, schema: z.enum(values) }
  },

  tone<const V extends string>(
    label: string,
    options: readonly V[],
    opts: CommonOpts & { palette?: "tone" | "background" } = {}
  ): ToneField<V> {
    return {
      kind: "tone",
      label,
      help: opts.help,
      options,
      palette: opts.palette ?? "tone",
      schema: z.enum(options as unknown as [V, ...V[]]),
    }
  },

  number(label: string, opts: CommonOpts & { min: number; max: number; step?: number }): NumberField {
    return {
      kind: "number",
      label,
      help: opts.help,
      min: opts.min,
      max: opts.max,
      step: opts.step,
      schema: z
        .number()
        .int()
        .min(opts.min, `${label}: nhỏ nhất là ${opts.min}`)
        .max(opts.max, `${label}: lớn nhất là ${opts.max}`),
    }
  },

  boolean(label: string, opts: CommonOpts = {}): BooleanField {
    return { kind: "boolean", label, help: opts.help, schema: z.boolean() }
  },

  list<const M extends FieldMap>(
    label: string,
    fields: M,
    opts: CommonOpts & {
      itemLabel: string
      titleKey?: keyof M & string
      minItems?: number
      maxItems?: number
      newItem: PropsOf<M>
    }
  ): ListField<PropsOf<M>> {
    const minItems = opts.minItems ?? 0
    const maxItems = opts.maxItems ?? 24
    return {
      kind: "list",
      label,
      help: opts.help,
      fields,
      itemLabel: opts.itemLabel,
      titleKey: opts.titleKey,
      minItems,
      maxItems,
      newItem: opts.newItem,
      schema: z
        .array(objectSchemaFromFields(fields))
        .min(minItems, `${label}: cần ít nhất ${minItems} mục`)
        .max(maxItems, `${label}: tối đa ${maxItems} mục`),
    }
  },
}

export function objectSchemaFromFields(fields: FieldMap) {
  const shape: Record<string, z.ZodType> = {}
  for (const [key, field] of Object.entries(fields)) {
    shape[key] = field.schema
  }
  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Coerce: đọc dữ liệu bất kỳ, giữ phần hợp lệ, phần thiếu/hỏng lấy từ mặc định
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function coerceValue(field: AnyField, raw: unknown, fallback: unknown): unknown {
  if (raw === undefined || raw === null) return fallback

  if (field.kind === "list") {
    if (!Array.isArray(raw)) return fallback
    return raw
      .filter(isRecord)
      .slice(0, field.maxItems)
      .map((item) => coerceObject(field.fields, item, field.newItem))
  }

  if (field.kind === "number" && typeof raw === "string" && raw.trim() !== "") {
    const numeric = Number(raw)
    if (Number.isFinite(numeric)) raw = Math.round(numeric)
  }

  if (field.kind === "number" && typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(field.max, Math.max(field.min, Math.round(raw)))
  }

  if ((field.kind === "text" || field.kind === "textarea" || field.kind === "markdown") && typeof raw === "number") {
    raw = String(raw)
  }

  const result = field.schema.safeParse(raw)
  return result.success ? result.data : fallback
}

export function coerceObject<P extends Record<string, unknown>>(fields: FieldMap, raw: unknown, defaults: P): P {
  const source = isRecord(raw) ? raw : {}
  const output: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(fields)) {
    output[key] = coerceValue(field, source[key], defaults[key])
  }
  return output as P
}
