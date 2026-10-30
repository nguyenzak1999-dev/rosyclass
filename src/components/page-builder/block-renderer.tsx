import type React from "react"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/page-builder/document"
import type { BlockProps, BlockType } from "@/lib/page-builder/registry"
import type { PageBuilderData } from "@/lib/page-builder/types"
import { HeroBlock } from "./blocks/hero"
import {
  FeaturesBlock,
  ImageTextBlock,
  LearningPathBlock,
  RichTextBlock,
  StatisticsBlock,
} from "./blocks/content-blocks"
import {
  FeaturedCoursesBlock,
  FeaturedTeachersBlock,
  TestimonialsBlock,
  UpcomingClassesBlock,
} from "./blocks/data-blocks"
import { ContactInfoBlock, CtaBlock, FaqBlock } from "./blocks/engage-blocks"
import { DividerBlock, GalleryBlock, PageContentBlock, SpacerBlock, VideoEmbedBlock } from "./blocks/media-layout-blocks"
import type { BlockComponentProps, BlockRenderContext, RenderMode } from "./blocks/shared"
import { PageAnimations } from "./page-animations"

type BlockComponentMap = {
  [T in BlockType]: (input: BlockComponentProps<BlockProps<T>>) => React.ReactNode
}

export const BLOCK_COMPONENTS: BlockComponentMap = {
  hero: HeroBlock,
  features: FeaturesBlock,
  statistics: StatisticsBlock,
  learningPath: LearningPathBlock,
  featuredCourses: FeaturedCoursesBlock,
  upcomingClasses: UpcomingClassesBlock,
  featuredTeachers: FeaturedTeachersBlock,
  testimonials: TestimonialsBlock,
  faq: FaqBlock,
  cta: CtaBlock,
  richText: RichTextBlock,
  imageText: ImageTextBlock,
  gallery: GalleryBlock,
  videoEmbed: VideoEmbedBlock,
  contactInfo: ContactInfoBlock,
  spacer: SpacerBlock,
  pageContent: PageContentBlock,
  divider: DividerBlock,
}

/** Render một block. Dùng chung cho trang công khai và canvas của builder. */
export function BlockView({ block, ctx }: { block: Block; ctx: BlockRenderContext }) {
  const Component = BLOCK_COMPONENTS[block.type] as (input: BlockComponentProps<unknown>) => React.ReactNode
  return <Component props={block.props} ctx={ctx} />
}

/**
 * Wrapper chứa container query: các block dùng biến thể @3xl/@5xl thay cho md/lg
 * để bản xem trước theo khung điện thoại/máy tính bảng trong builder hiển thị đúng.
 */
export function BlockCanvasRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("@container w-full bg-kid-cream font-kid-body text-kid-ink", className)}>{children}</div>
}

export function PageBlocks({
  blocks,
  data,
  mode = "public",
  className,
  mainContent,
}: {
  blocks: Block[]
  data: PageBuilderData
  mode?: RenderMode
  className?: string
  /** Phần chức năng của trang hệ thống, đặt tại khối "Nội dung chính của trang" */
  mainContent?: React.ReactNode
}) {
  const ctx: BlockRenderContext = { mode, data, mainContent }
  const content = (
    <BlockCanvasRoot className={className}>
      {blocks
        .filter((block) => !block.hidden)
        .map((block) => (
          <BlockView key={block.id} block={block} ctx={ctx} />
        ))}
    </BlockCanvasRoot>
  )
  // Hiệu ứng cuộn chỉ chạy trên trang thật, không chạy trong canvas của builder
  return mode === "public" ? <PageAnimations>{content}</PageAnimations> : content
}
