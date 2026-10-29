import { PageBlocks } from "@/components/page-builder/block-renderer"
import { getHomeBlocks, loadDataForBlocks } from "@/lib/page-builder/pages"

// Cache 1 ngày (Workers KV); admin sửa nội dung thì làm mới ngay qua revalidatePublicSite()
export const revalidate = 86400

// SEO trang chủ giữ nguyên: metadata mặc định lấy từ Cài đặt website ở root layout.
export default async function HomePage() {
  const blocks = await getHomeBlocks()
  const data = await loadDataForBlocks(blocks)

  return <PageBlocks blocks={blocks} data={data} className="pb-10" />
}
