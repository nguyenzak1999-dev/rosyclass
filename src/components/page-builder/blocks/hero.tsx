import { Cloud, KidBadge, Sparkle, toneClasses } from "@/components/kids"
import type React from "react"
import { cn } from "@/lib/utils"
import type { BlockProps } from "@/lib/page-builder/registry"
import { BlockSection, Container, type BlockComponentProps } from "./shared"
import { HeroBannerCarousel } from "./hero-carousel"
import { HeroButtons, HeroImage } from "./hero-parts"

type HeroProps = BlockProps<"hero">

/** Lớp + độ trễ cho hiệu ứng vào trang; trong builder không chạy để khỏi nháy khi đang sửa */
function entrance(animate: boolean, className: string, delay: number) {
  return animate ? { className, style: { "--kid-delay": `${delay}s` } as React.CSSProperties } : {}
}

/** Tách tiêu đề thành từng từ để bật lên lần lượt */
function AnimatedWords({ text, animate, startDelay }: { text: string; animate: boolean; startDelay: number }) {
  if (!animate) return <>{text}</>
  return (
    <>
      {text.split(/(\s+)/).map((part, index) =>
        /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={index} {...entrance(true, "kid-word", startDelay + index * 0.045)}>
            {part}
          </span>
        )
      )}
    </>
  )
}

export function HeroBlock({ props, ctx }: BlockComponentProps<HeroProps>) {
  const banners = props.useBanners ? (ctx.data.banners ?? []) : []
  const animate = ctx.mode === "public"
  const titleWords = props.title.split(/\s+/).filter(Boolean).length
  const afterTitle = 0.25 + titleWords * 0.045

  return (
    <BlockSection background={props.background} anchor={props.anchor} className="pt-10 @3xl:pt-16">
      <HeroDecorations />
      <Container>
        {banners.length > 0 ? (
          <HeroBannerCarousel
            slides={banners}
            accent={props.accent}
            badge={props.badge}
            secondaryText={props.button2Text}
            secondaryLink={props.button2Link}
            footnote={props.footnote}
          />
        ) : (
          <div className="grid items-center gap-10 @3xl:grid-cols-[1.05fr_0.95fr] @5xl:gap-16">
            <div className="flex flex-col items-start gap-6">
              {props.badge ? (
                <div {...entrance(animate, "kid-hero-in", 0.05)}>
                  <KidBadge tone={props.accent === "sun" ? "rose" : "sun"}>{props.badge}</KidBadge>
                </div>
              ) : null}
              <h1 className="text-[40px] leading-[1.05] font-extrabold text-kid-ink @3xl:text-[54px] @5xl:text-[68px]">
                <AnimatedWords text={props.title} animate={animate} startDelay={0.2} />
                {props.highlight ? (
                  <>
                    {" "}
                    {/* Lớp ngoài chạy hiệu ứng, lớp trong giữ góc nghiêng -2 độ */}
                    <span className={cn("inline-block", animate && "kid-swing-in")} style={animate ? ({ "--kid-delay": `${afterTitle}s` } as React.CSSProperties) : undefined}>
                      <span
                        className={cn(
                          "kid-border kid-shadow-sm mt-2 inline-block -rotate-2 rounded-kid px-4 pb-1",
                          toneClasses[props.accent].solid
                        )}
                      >
                        {props.highlight}
                      </span>
                    </span>
                  </>
                ) : null}
              </h1>
              {props.description ? (
                <p
                  className={cn("max-w-[560px] text-[18px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:text-[20px]", animate && "kid-hero-in")}
                  style={animate ? ({ "--kid-delay": `${afterTitle + 0.15}s` } as React.CSSProperties) : undefined}
                >
                  {props.description}
                </p>
              ) : null}
              <div
                className={cn("w-full @md:w-auto", animate && "kid-hero-in")}
                style={animate ? ({ "--kid-delay": `${afterTitle + 0.3}s` } as React.CSSProperties) : undefined}
              >
                <HeroButtons
                  primaryText={props.button1Text}
                  primaryLink={props.button1Link}
                  secondaryText={props.button2Text}
                  secondaryLink={props.button2Link}
                  accent={props.accent}
                  nudge={animate}
                />
              </div>
              {props.footnote ? (
                <p
                  className={cn("text-[14px] text-kid-ink-soft", animate && "kid-hero-in")}
                  style={animate ? ({ "--kid-delay": `${afterTitle + 0.45}s` } as React.CSSProperties) : undefined}
                >
                  {props.footnote}
                </p>
              ) : null}
            </div>
            <div {...entrance(animate, "kid-swing-in", 0.35)} data-hero-parallax>
              <HeroImage src={props.image} alt={props.imageAlt || props.title} accent={props.accent} />
            </div>
          </div>
        )}
      </Container>
    </BlockSection>
  )
}

function HeroDecorations() {
  return (
    <>
      <Cloud className="kid-float-slow pointer-events-none absolute top-6 -left-10 h-14 w-28 opacity-90 @3xl:h-20 @3xl:w-40" />
      <Cloud className="kid-float pointer-events-none absolute right-[8%] bottom-6 hidden h-12 w-24 opacity-80 @3xl:block" />
      <Sparkle className="kid-spin-slow pointer-events-none absolute top-10 right-6 h-8 w-8 fill-kid-sun" />
    </>
  )
}
