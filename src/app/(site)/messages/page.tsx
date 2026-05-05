import { Suspense } from "react"
import { CreatorMessagesView } from "@/features/creator/messages/creator-messages-view"

export default function SiteMessagesPage() {
  return (
    <main className="mx-auto h-[100svh] min-h-0 w-full max-w-7xl overflow-hidden pt-24 pb-4">
      <div className="h-full min-h-0 overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>}>
          <CreatorMessagesView viewerRole="buyer" />
        </Suspense>
      </div>
    </main>
  )
}
