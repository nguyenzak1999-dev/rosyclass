import { KidCard, Sparkle, Star, toneAt, toneClasses } from "@/components/kids"
import { cn } from "@/lib/utils"
import { renderMarkdown } from "@/lib/page-builder/markdown"
import type { BlockProps } from "@/lib/page-builder/registry"
import {
  BlockButton,
  BlockHeading,
  BlockImage,
  BlockSection,
  Container,
  EmptyState,
  markdownClasses,
  type BlockComponentProps,
} from "./shared"

// ---------------------------------------------------------------------------
// Ưu điểm
// ---------------------------------------------------------------------------

export function FeaturesBlock({ props, ctx }: BlockComponentProps<BlockProps<"features">>) {
  const items = props.items.filter((item) => item.title || item.description || item.image)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <BlockHeading
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          className="mb-10 @3xl:mb-14"
        />
        {items.length === 0 ? (
          <EmptyState mode={ctx.mode} title="Chưa có ưu điểm nào" editorHint="Thêm ưu điểm trong bảng thuộc tính bên phải" />
        ) : props.layout === "alternate" ? (
          <div className="flex flex-col gap-14 @3xl:gap-20">
            {items.map((item, index) => {
              const tone = toneAt(index)
              const reverse = index % 2 === 1
              return (
                <div key={index} className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
                  <div className={cn("relative", reverse && "@3xl:order-2")}>
                    <div
                      className={cn(
                        "kid-border kid-shadow overflow-hidden rounded-kid-lg bg-white",
                        reverse ? "rotate-2" : "-rotate-2"
                      )}
                    >
                      <BlockImage src={item.image} alt={item.title} tone={tone} className="aspect-[4/3] w-full" />
                    </div>
                    <Star className={cn("absolute -top-5 h-12 w-12", reverse ? "-left-3" : "-right-3")} />
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <span
                      className={cn(
                        "kid-border flex h-12 w-12 items-center justify-center rounded-full font-kid-display text-[20px] font-extrabold",
                        toneClasses[tone].solid
                      )}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    {item.title ? (
                      <h3 className="text-[28px] leading-tight font-extrabold @3xl:text-[36px]">{item.title}</h3>
                    ) : null}
                    {item.description ? (
                      <p className="text-[17px] leading-relaxed whitespace-pre-line text-kid-ink-soft">{item.description}</p>
                    ) : null}
                    <BlockButton text={item.buttonText} link={item.buttonLink} tone={tone} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @5xl:grid-cols-3">
            {items.map((item, index) => {
              const tone = toneAt(index)
              return (
                <KidCard key={index} tone={tone} interactive className="flex flex-col gap-4 p-5">
                  {item.image ? (
                    <div className="kid-border overflow-hidden rounded-[20px] bg-white">
                      <BlockImage src={item.image} alt={item.title} tone={tone} className="aspect-[4/3] w-full" />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "kid-border flex h-14 w-14 items-center justify-center rounded-2xl",
                        toneClasses[tone].solid
                      )}
                      aria-hidden="true"
                    >
                      <Sparkle className="h-7 w-7 fill-white" />
                    </span>
                  )}
                  {item.title ? <h3 className="text-[22px] leading-tight font-extrabold">{item.title}</h3> : null}
                  {item.description ? (
                    <p className="text-[16px] leading-relaxed whitespace-pre-line text-kid-ink-soft">{item.description}</p>
                  ) : null}
                  {item.buttonText && item.buttonLink ? (
                    <div className="mt-auto pt-2">
                      <BlockButton text={item.buttonText} link={item.buttonLink} tone="white" size="sm" />
                    </div>
                  ) : null}
                </KidCard>
              )
            })}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Thống kê
// ---------------------------------------------------------------------------

export function StatisticsBlock({ props, ctx }: BlockComponentProps<BlockProps<"statistics">>) {
  const items = props.items.filter((item) => item.number || item.label)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <BlockHeading eyebrow={props.eyebrow} title={props.title} highlight={props.highlight} className="mb-10" />
        {items.length === 0 ? (
          <EmptyState mode={ctx.mode} title="Chưa có con số nào" editorHint="Thêm con số trong bảng thuộc tính" />
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-8 pt-4 @3xl:gap-x-6 @5xl:grid-cols-4">
            {items.map((item, index) => {
              const tone = toneAt(index)
              return (
                <div
                  key={index}
                  className={cn(
                    "kid-border kid-shadow relative flex flex-col items-center justify-center gap-1 rounded-kid bg-white px-3 pt-8 pb-6 text-center @3xl:pb-8",
                    index % 2 === 0 ? "-rotate-1" : "rotate-1"
                  )}
                >
                  <span
                    className={cn("kid-border absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full", toneClasses[tone].solid)}
                    aria-hidden="true"
                  />
                  <dt className="order-2 text-[14px] leading-snug font-bold text-kid-ink-soft @3xl:text-[16px]">{item.label}</dt>
                  <dd
                    data-count={ctx.mode === "public" ? item.number : undefined}
                    className="order-1 font-kid-display text-[36px] leading-none font-extrabold text-kid-ink @3xl:text-[52px]"
                  >
                    {item.number}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Lộ trình học
// ---------------------------------------------------------------------------

export function LearningPathBlock({ props, ctx }: BlockComponentProps<BlockProps<"learningPath">>) {
  const steps = props.steps.filter((step) => step.title || step.text)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <div className="mb-10 flex flex-col gap-6 @3xl:mb-14 @5xl:flex-row @5xl:items-end @5xl:justify-between">
          <BlockHeading
            eyebrow={props.eyebrow}
            title={props.title}
            highlight={props.highlight}
            description={props.description}
            align="left"
            tone="mint"
          />
          <BlockButton text={props.buttonText} link={props.buttonLink} tone="mint" className="self-start @5xl:self-auto" />
        </div>
        {steps.length === 0 ? (
          <EmptyState mode={ctx.mode} title="Chưa có bước nào" editorHint="Thêm các bước trong bảng thuộc tính" />
        ) : (
          <ol className="grid gap-6 @3xl:grid-cols-2 @5xl:grid-cols-4">
            {steps.map((step, index) => {
              const tone = toneAt(index)
              return (
                <li key={index} className="relative">
                  <KidCard className="flex h-full flex-col gap-3 pt-8">
                    <span
                      className={cn(
                        "kid-border kid-shadow-sm absolute -top-5 left-6 flex h-12 w-12 items-center justify-center rounded-full font-kid-display text-[22px] font-extrabold",
                        toneClasses[tone].solid
                      )}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-[21px] leading-tight font-extrabold">
                      <span className="sr-only">Bước {index + 1}: </span>
                      {step.title}
                    </h3>
                    {step.text ? (
                      <p className="text-[15px] leading-relaxed whitespace-pre-line text-kid-ink-soft">{step.text}</p>
                    ) : null}
                  </KidCard>
                </li>
              )
            })}
          </ol>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Văn bản
// ---------------------------------------------------------------------------

export function RichTextBlock({ props, ctx }: BlockComponentProps<BlockProps<"richText">>) {
  const html = renderMarkdown(props.content)
  const body = html ? (
    <div
      className={cn(markdownClasses, props.align === "center" && "text-center [&_ol]:text-left [&_ul]:text-left")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <EmptyState mode={ctx.mode} title="Khối văn bản trống" editorHint="Nhập nội dung trong bảng thuộc tính" />
  )

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container className={props.width === "narrow" ? "max-w-[760px]" : undefined}>
        {props.card && html ? <KidCard className="p-6 @3xl:p-10">{body}</KidCard> : body}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Ảnh + văn bản
// ---------------------------------------------------------------------------

export function ImageTextBlock({ props }: BlockComponentProps<BlockProps<"imageText">>) {
  const html = renderMarkdown(props.content)
  const imageRight = props.imagePosition === "right"

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <div className="grid items-center gap-10 @3xl:grid-cols-2 @5xl:gap-16">
          <div className={cn("relative mx-auto w-full max-w-[560px]", imageRight && "@3xl:order-2")}>
            <div
              className={cn("absolute inset-0 translate-x-3 translate-y-3 rounded-kid-lg", toneClasses[props.accent].solid)}
              aria-hidden="true"
            />
            <div className="kid-border relative overflow-hidden rounded-kid-lg bg-white">
              <BlockImage
                src={props.image}
                alt={props.imageAlt || props.title}
                tone={props.accent}
                className="aspect-[4/3] w-full"
              />
            </div>
            <Sparkle className={cn("kid-float absolute -top-4 h-10 w-10 fill-kid-sun", imageRight ? "-left-3" : "-right-3")} />
          </div>
          <div className="flex flex-col items-start gap-5">
            <BlockHeading
              eyebrow={props.eyebrow}
              title={props.title}
              highlight={props.highlight}
              align="left"
              tone={props.accent}
            />
            {html ? <div className={markdownClasses} dangerouslySetInnerHTML={{ __html: html }} /> : null}
            <BlockButton text={props.buttonText} link={props.buttonLink} tone={props.accent} />
          </div>
        </div>
      </Container>
    </BlockSection>
  )
}
