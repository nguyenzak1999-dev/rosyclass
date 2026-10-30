import { Sparkle, Squiggle, Star, WaveDivider, toneAt } from "@/components/kids"
import { cn } from "@/lib/utils"
import { parseYouTubeId } from "@/lib/page-builder/video"
import { backgroundClasses, backgroundTextClasses } from "@/lib/page-builder/styles"
import type { BlockProps } from "@/lib/page-builder/registry"
import { anchorId, BlockHeading, BlockImage, BlockSection, Container, EmptyState, type BlockComponentProps } from "./shared"
import { YouTubeFacade } from "./video-player"

// ---------------------------------------------------------------------------
// Thư viện ảnh
// ---------------------------------------------------------------------------

const galleryColumns = {
  "2": "@3xl:grid-cols-2",
  "3": "@3xl:grid-cols-3",
  "4": "@3xl:grid-cols-3 @5xl:grid-cols-4",
} as const

export function GalleryBlock({ props, ctx }: BlockComponentProps<BlockProps<"gallery">>) {
  const items = props.items.filter((item) => item.image)
  // Khối chưa có nội dung thì ẩn trên trang thật (builder vẫn hiện khung nhắc)
  if (items.length === 0 && ctx.mode === "public") return null

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <BlockHeading
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          tone="orange"
          className="mb-10 @3xl:mb-14"
        />
        {items.length === 0 ? (
          <EmptyState mode={ctx.mode} title="Chưa có ảnh nào" editorHint="Thêm ảnh trong bảng thuộc tính" />
        ) : (
          <ul className={cn("grid grid-cols-2 gap-4 @3xl:gap-6", galleryColumns[props.columns])}>
            {items.map((item, index) => (
              <li key={index}>
                <figure
                  className={cn(
                    "kid-border kid-shadow overflow-hidden rounded-kid bg-white",
                    index % 3 === 0 ? "-rotate-1" : index % 3 === 1 ? "rotate-1" : "rotate-0"
                  )}
                >
                  <BlockImage
                    src={item.image}
                    alt={item.caption || `${props.title || "Ảnh"} ${index + 1}`}
                    tone={toneAt(index)}
                    className="aspect-square w-full"
                  />
                  {item.caption ? (
                    <figcaption className="border-t-[3px] border-kid-ink px-3 py-2 text-center font-kid-display text-[15px] font-bold">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Video YouTube
// ---------------------------------------------------------------------------

export function VideoEmbedBlock({ props, ctx }: BlockComponentProps<BlockProps<"videoEmbed">>) {
  const videoId = parseYouTubeId(props.url)
  if (!videoId && ctx.mode === "public") return null

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container className="max-w-[960px]">
        <BlockHeading
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          tone="rose"
          className="mb-10"
        />
        {videoId ? (
          <div className="relative">
            <Star className="kid-float absolute -top-6 -left-4 z-10 h-14 w-14" />
            <div className="kid-border kid-shadow relative aspect-video overflow-hidden rounded-kid-lg bg-kid-ink">
              <YouTubeFacade videoId={videoId} title={props.title || "Video RosyClass"} poster={props.poster} />
            </div>
          </div>
        ) : (
          <EmptyState
            mode={ctx.mode}
            title={props.url ? "Link YouTube chưa hợp lệ" : "Chưa có video"}
            editorHint="Dán link dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
          />
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Khoảng trống & đường phân cách
// ---------------------------------------------------------------------------

const spacerHeights = {
  sm: "h-6 @3xl:h-8",
  md: "h-10 @3xl:h-16",
  lg: "h-16 @3xl:h-24",
  xl: "h-24 @3xl:h-40",
} as const

export function SpacerBlock({ props }: BlockComponentProps<BlockProps<"spacer">>) {
  return (
    <div
      id={anchorId(props.anchor)}
      className={cn("scroll-mt-20", backgroundClasses[props.background], spacerHeights[props.size])}
      aria-hidden="true"
    />
  )
}

export function DividerBlock({ props }: BlockComponentProps<BlockProps<"divider">>) {
  if (props.style === "wave") {
    return (
      <div className={cn("relative", backgroundClasses[props.background])} aria-hidden="true">
        <WaveDivider
          flip={props.flip}
          className={cn("block h-[40px] w-full @3xl:h-[70px]", backgroundTextClasses[props.color])}
        />
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center justify-center gap-4 py-6 @3xl:py-10", backgroundClasses[props.background])}
      aria-hidden="true"
    >
      {props.style === "squiggle" ? (
        <Squiggle className="h-5 w-48 @3xl:w-72" />
      ) : (
        <>
          <Sparkle className="h-6 w-6 fill-kid-sky" />
          <Star className="h-10 w-10" />
          <Sparkle className="h-6 w-6 fill-kid-rose" />
        </>
      )}
    </div>
  )
}
