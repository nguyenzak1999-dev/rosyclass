import { Clock, Mail, MapPin, Phone, Plus } from "lucide-react"
import { Cloud, KidBadge, Sparkle, Star, toneAt, toneClasses } from "@/components/kids"
import { cn } from "@/lib/utils"
import { safeMapEmbedUrl } from "@/lib/page-builder/video"
import type { BlockProps } from "@/lib/page-builder/registry"
import {
  BlockButton,
  BlockHeading,
  BlockImage,
  BlockSection,
  Container,
  EmptyState,
  HighlightedText,
  type BlockComponentProps,
} from "./shared"

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export function FaqBlock({ props, ctx }: BlockComponentProps<BlockProps<"faq">>) {
  const inline = props.items.filter((item) => item.question)
  const fromDb = (ctx.data.faqs ?? []).slice(0, props.limit)
  // Nguồn CMS trống thì dùng câu hỏi tự nhập làm dự phòng
  const faqs = props.source === "db" ? (fromDb.length > 0 ? fromDb : inline) : inline

  if (faqs.length === 0 && ctx.mode === "public") return null

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <div className="grid gap-10 @5xl:grid-cols-[0.8fr_1.2fr] @5xl:gap-14">
          <div className="flex flex-col items-start gap-6">
            <BlockHeading
              eyebrow={props.eyebrow}
              title={props.title}
              highlight={props.highlight}
              description={props.description}
              align="left"
              tone="sky"
            />
            <BlockButton text={props.buttonText} link={props.buttonLink} tone="sky" />
            <Cloud className="kid-float-slow hidden h-20 w-40 @5xl:block" />
          </div>
          {faqs.length === 0 ? (
            <EmptyState
              mode={ctx.mode}
              title="Chưa có câu hỏi nào"
              editorHint={
                props.source === "db"
                  ? "Khối lấy FAQ đang bật trong mục FAQ. Khi trống, khối sẽ ẩn trên trang thật."
                  : "Thêm câu hỏi trong bảng thuộc tính"
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => {
                const tone = toneAt(index)
                return (
                  <details
                    key={index}
                    className="group kid-border kid-shadow-sm rounded-kid bg-white open:bg-white"
                    open={index === 0 && ctx.mode === "editor" ? true : undefined}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-kid-display text-[18px] font-bold @3xl:p-6 @3xl:text-[20px] [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <span
                        className={cn(
                          "kid-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-open:rotate-45",
                          toneClasses[tone].solid
                        )}
                        aria-hidden="true"
                      >
                        <Plus className="h-5 w-5" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-[16px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:px-6 @3xl:pb-6">
                      {faq.answer}
                    </div>
                  </details>
                )
              })}
            </div>
          )}
        </div>
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------

export function CtaBlock({ props }: BlockComponentProps<BlockProps<"cta">>) {
  const tone = toneClasses[props.tone]
  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <div
          className={cn(
            "kid-border kid-shadow relative overflow-hidden rounded-kid-lg px-6 py-12 text-kid-ink @3xl:px-14 @3xl:py-16",
            tone.soft
          )}
        >
          <div className="kid-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className={cn("pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full opacity-90", tone.solid)}
            aria-hidden="true"
          />
          <Star className="kid-spin-slow absolute -top-4 right-6 h-16 w-16 @3xl:h-20 @3xl:w-20" />
          <Sparkle className={cn("kid-float absolute bottom-6 left-4 h-8 w-8", tone.fill)} />
          <div className={cn("relative grid items-center gap-10", props.image && "@3xl:grid-cols-[1.3fr_0.7fr]")}>
            <div className={cn("flex flex-col gap-5", props.image ? "items-start text-left" : "items-center text-center")}>
              <h2 className="max-w-[760px] text-[32px] leading-[1.1] font-extrabold @3xl:text-[46px]">
                <HighlightedText title={props.title} highlight={props.highlight} />
              </h2>
              {props.description ? (
                <p className="max-w-[620px] text-[17px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:text-[19px]">
                  {props.description}
                </p>
              ) : null}
              <div className={cn("flex w-full flex-col gap-3 @md:w-auto @md:flex-row @md:flex-wrap", !props.image && "@md:justify-center")}>
                <BlockButton text={props.buttonText} link={props.buttonLink} tone={props.tone} size="lg" />
                <BlockButton text={props.button2Text} link={props.button2Link} tone="white" size="lg" />
              </div>
            </div>
            {props.image ? (
              <div className="kid-border mx-auto w-full max-w-[320px] rotate-3 overflow-hidden rounded-kid bg-white">
                <BlockImage src={props.image} alt="" className="aspect-square w-full" tone={props.tone} />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Thông tin liên hệ
// ---------------------------------------------------------------------------

export function ContactInfoBlock({ props, ctx }: BlockComponentProps<BlockProps<"contactInfo">>) {
  const contact = ctx.data.contact
  const mapUrl = props.showMap ? safeMapEmbedUrl(contact?.googleMapEmbedUrl) : null

  const rows = contact
    ? [
        { icon: MapPin, label: "Địa chỉ", value: contact.address, href: undefined },
        { icon: Phone, label: "Điện thoại", value: contact.phone, href: contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined },
        { icon: Mail, label: "Email", value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
        { icon: Clock, label: "Giờ làm việc", value: contact.workingHours, href: undefined },
      ].filter((row) => row.value)
    : []

  const socials = contact && props.showSocial
    ? [
        { label: "Facebook", href: contact.facebook },
        { label: "YouTube", href: contact.youtube },
        { label: "Zalo", href: contact.zalo },
        { label: "TikTok", href: contact.tiktok },
      ].filter((item) => /^https?:\/\//i.test(item.href))
    : []

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <BlockHeading
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          tone="mint"
          className="mb-10 @3xl:mb-14"
        />
        {rows.length === 0 ? (
          <EmptyState
            mode={ctx.mode}
            title="Thông tin liên hệ đang được cập nhật"
            editorHint="Khối lấy địa chỉ, điện thoại, email trong Cài đặt website"
          />
        ) : (
          <div className={cn("grid gap-8", mapUrl && "@5xl:grid-cols-2")}>
            <div className="flex flex-col gap-4">
              <ul className="grid gap-4 @xl:grid-cols-2">
                {rows.map((row, index) => {
                  const Icon = row.icon
                  const tone = toneAt(index)
                  const content = (
                    <>
                      <span
                        className={cn("kid-border flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", toneClasses[tone].solid)}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[14px] font-bold text-kid-ink-soft">{row.label}</span>
                        <span className="font-kid-display text-[17px] font-bold break-words text-kid-ink">{row.value}</span>
                      </span>
                    </>
                  )
                  return (
                    <li key={row.label}>
                      {row.href ? (
                        <a
                          href={row.href}
                          className="kid-border kid-shadow-sm kid-pop flex h-full items-center gap-4 rounded-kid bg-white p-4 focus-visible:ring-4 focus-visible:ring-kid-sun/60 focus-visible:outline-none"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="kid-border kid-shadow-sm flex h-full items-center gap-4 rounded-kid bg-white p-4">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
              {socials.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {socials.map((social, index) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="kid-pop">
                      <KidBadge tone={toneAt(index + 2)}>{social.label}</KidBadge>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="pt-2">
                <BlockButton text={props.buttonText} link={props.buttonLink} tone="mint" />
              </div>
            </div>
            {mapUrl ? (
              <div className="kid-border kid-shadow overflow-hidden rounded-kid bg-white">
                <iframe
                  src={mapUrl}
                  title={`Bản đồ ${contact?.siteName ?? ""}`.trim()}
                  className="block h-[320px] w-full @3xl:h-full @3xl:min-h-[360px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}
