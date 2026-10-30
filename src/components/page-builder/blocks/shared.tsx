import type React from "react"
import { cn } from "@/lib/utils"
import { KidBadge, KidButton, Squiggle, Star, toneClasses, type KidTone } from "@/components/kids"
import { backgroundClasses, type BlockBackground } from "@/lib/page-builder/styles"
import type { PageBuilderData } from "@/lib/page-builder/types"

export type RenderMode = "public" | "editor"

export interface BlockRenderContext {
  mode: RenderMode
  data: PageBuilderData
}

export interface BlockComponentProps<P> {
  props: P
  ctx: BlockRenderContext
}

const ANCHOR_RE = /^[a-z0-9][a-z0-9-]{0,39}$/

/** "Khoá học 2026" → "khoa-hoc-2026": anchor gõ có dấu, chữ hoa, khoảng trắng vẫn dùng được thay vì bị bỏ */
export function anchorId(anchor?: string) {
  const id = (anchor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  return ANCHOR_RE.test(id) ? id : undefined
}

export function BlockSection({
  background,
  anchor,
  className,
  children,
  ...rest
}: {
  background: BlockBackground
  anchor?: string
  className?: string
  children: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <section
      id={anchorId(anchor)}
      className={cn(
        // scroll-mt: link #neo không bị thanh menu cố định (80px) che mất tiêu đề
        "relative scroll-mt-20 overflow-hidden px-4 py-14 text-kid-ink @3xl:px-8 @3xl:py-20 @5xl:py-24",
        backgroundClasses[background],
        className
      )}
      {...rest}
    >
      {children}
    </section>
  )
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("relative mx-auto w-full max-w-[1200px]", className)}>{children}</div>
}

/** Tiêu đề có một cụm từ được gạch chân nguệch ngoạc */
export function HighlightedText({ title, highlight }: { title: string; highlight?: string }) {
  const index = highlight ? title.indexOf(highlight) : -1
  if (!highlight || index < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, index)}
      <span className="relative inline-block">
        <span className="relative z-10">{highlight}</span>
        <Squiggle className="absolute -bottom-1.5 left-0 h-3 w-full @3xl:-bottom-2 @3xl:h-4" />
      </span>
      {title.slice(index + highlight.length)}
    </>
  )
}

export function BlockHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  tone = "sun",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string
  title?: string
  highlight?: string
  description?: string
  align?: "left" | "center"
  tone?: KidTone
  as?: "h1" | "h2"
  className?: string
}) {
  if (!eyebrow && !title && !description) return null
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <KidBadge tone={tone}>{eyebrow}</KidBadge> : null}
      {title ? (
        <Tag className="max-w-[820px] text-[30px] leading-[1.12] font-extrabold text-kid-ink @3xl:text-[42px] @5xl:text-[50px]">
          <HighlightedText title={title} highlight={highlight} />
        </Tag>
      ) : null}
      {description ? (
        <p className="max-w-[640px] text-[16px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:text-[18px]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/** Ảnh thường (không dùng next/image vì URL ảnh do admin nhập có thể ở bất kỳ host nào) */
export function BlockImage({
  src,
  alt,
  className,
  tone = "sky",
  eager = false,
}: {
  src?: string | null
  alt: string
  className?: string
  tone?: KidTone
  eager?: boolean
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt || "Ảnh minh hoạ"}
        className={cn("kid-dots flex items-center justify-center", toneClasses[tone].soft, className)}
      >
        <Star className="h-14 w-14 opacity-80" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  )
}

export function BlockButton({
  text,
  link,
  tone = "rose",
  size = "md",
  className,
}: {
  text?: string
  link?: string
  tone?: React.ComponentProps<typeof KidButton>["tone"]
  size?: React.ComponentProps<typeof KidButton>["size"]
  className?: string
}) {
  if (!text || !link) return null
  return (
    <KidButton
      href={link}
      tone={tone}
      size={size}
      className={cn(
        "h-auto py-2 text-center leading-tight whitespace-normal",
        size === "lg" ? "min-h-14" : size === "sm" ? "min-h-10" : "min-h-12",
        className
      )}
    >
      {text}
    </KidButton>
  )
}

export function EmptyState({
  mode,
  title,
  description,
  editorHint,
  action,
}: {
  mode: RenderMode
  title: string
  description?: string
  editorHint?: string
  action?: React.ReactNode
}) {
  // Khung trống chỉ để nhắc admin trong builder, khách xem website không thấy
  if (mode === "public") return null
  return (
    <div className="kid-border mx-auto flex max-w-[560px] flex-col items-center gap-3 rounded-kid bg-white/80 px-6 py-10 text-center">
      <Star className="h-10 w-10" />
      <p className="font-kid-display text-[20px] font-bold text-kid-ink">{title}</p>
      {description ? <p className="text-[15px] text-kid-ink-soft">{description}</p> : null}
      {mode === "editor" && editorHint ? (
        <p className="rounded-full bg-kid-sun-soft px-4 py-1 text-[13px] font-semibold text-kid-ink">{editorHint}</p>
      ) : null}
      {action}
    </div>
  )
}

/** Hàng tiêu đề trái + nút phải dùng cho các khối danh sách */
export function HeadingRow({
  eyebrow,
  title,
  highlight,
  description,
  buttonText,
  buttonLink,
  tone,
}: {
  eyebrow?: string
  title?: string
  highlight?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  tone?: KidTone
}) {
  const hasHeading = Boolean(eyebrow || title || description)
  const hasButton = Boolean(buttonText && buttonLink)
  if (!hasHeading && !hasButton) return null
  return (
    <div className="mb-10 flex flex-col gap-6 @3xl:mb-14 @3xl:flex-row @3xl:items-end @3xl:justify-between">
      <BlockHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} align="left" tone={tone} />
      {hasButton ? (
        <BlockButton text={buttonText} link={buttonLink} tone="white" className="self-start @3xl:self-auto" />
      ) : null}
    </div>
  )
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "R"
  )
}

export const markdownClasses = cn(
  "text-[17px] leading-relaxed text-kid-ink-soft",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:text-kid-ink @3xl:[&_h2]:text-[34px]",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:text-kid-ink",
  "[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-[19px] [&_h4]:font-bold [&_h4]:text-kid-ink",
  "[&_p]:my-3 [&_strong]:font-bold [&_strong]:text-kid-ink",
  "[&_a]:font-bold [&_a]:text-kid-ink [&_a]:underline [&_a]:decoration-kid-rose [&_a]:decoration-[3px] [&_a]:underline-offset-4 hover:[&_a]:text-kid-rose",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li]:marker:text-kid-rose",
  "[&_blockquote]:my-5 [&_blockquote]:rounded-kid [&_blockquote]:border-l-[6px] [&_blockquote]:border-kid-sun [&_blockquote]:bg-kid-sun-soft [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-kid-ink",
  "[&_code]:rounded-md [&_code]:bg-kid-grape-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
  "[&_hr]:my-8 [&_hr]:border-t-[3px] [&_hr]:border-dashed [&_hr]:border-kid-ink/20",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
)
