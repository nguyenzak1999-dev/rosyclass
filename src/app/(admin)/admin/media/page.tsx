import { MediaClient } from "./media-client"

export default function MediaPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] py-4">
      <MediaClient />
    </div>
  )
}
