import { PageBlocks } from "@/components/page-builder/block-renderer"
import { getHomeBlocks, loadDataForBlocks } from "@/lib/page-builder/pages"

export const revalidate = 300

// SEO trang chủ giữ nguyên: metadata mặc định lấy từ Cài đặt website ở root layout.
export default async function HomePage() {
  const blocks = await getHomeBlocks()
  const data = await loadDataForBlocks(blocks)

  return <PageBlocks blocks={blocks} data={data} className="pb-10" />
}
