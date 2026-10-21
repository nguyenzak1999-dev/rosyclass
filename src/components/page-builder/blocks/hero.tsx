import { Cloud, KidBadge, Sparkle, toneClasses } from "@/components/kids"
import { cn } from "@/lib/utils"
import type { BlockProps } from "@/lib/page-builder/registry"
import { BlockSection, Container, type BlockComponentProps } from "./shared"
import { HeroBannerCarousel } from "./hero-carousel"
import { HeroButtons, HeroImage } from "./hero-parts"

type HeroProps = BlockProps<"hero">

export function HeroBlock({ props, ctx }: BlockComponentProps<HeroProps>) {
  const banners = props.useBanners ? (ctx.data.banners ?? []) : []

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
              {props.badge ? <KidBadge tone={props.accent === "sun" ? "rose" : "sun"}>{props.badge}</KidBadge> : null}
              <h1 className="text-[40px] leading-[1.05] font-extrabold text-kid-ink @3xl:text-[54px] @5xl:text-[68px]">
                {props.title}
                {props.highlight ? (
                  <>
                    {" "}
                    <span
                      className={cn(
                        "kid-border kid-shadow-sm mt-2 inline-block -rotate-2 rounded-kid px-4 pb-1",
                        toneClasses[props.accent].solid
                      )}
                    >
                      {props.highlight}
                    </span>
                  </>
                ) : null}
              </h1>
              {props.description ? (
                <p className="max-w-[560px] text-[18px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:text-[20px]">
                  {props.description}
                </p>
              ) : null}
              <HeroButtons
                primaryText={props.button1Text}
                primaryLink={props.button1Link}
                secondaryText={props.button2Text}
                secondaryLink={props.button2Link}
                accent={props.accent}
              />
              {props.footnote ? <p className="text-[14px] text-kid-ink-soft">{props.footnote}</p> : null}
            </div>
            <HeroImage src={props.image} alt={props.imageAlt || props.title} accent={props.accent} />
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
