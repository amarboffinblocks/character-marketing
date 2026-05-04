import { InboxView } from "@/features/inbox/components/inbox-view"

export default function SiteMessagesPage() {
<<<<<<< Updated upstream
  return <InboxView role="buyer" />
=======
  return (
    <main className="mx-auto h-[100svh] min-h-0 w-full max-w-7xl overflow-hidden pt-24 pb-4">
      <div className="h-full min-h-0 overflow-hidden">
        <CreatorMessagesView viewerRole="buyer" />
      </div>
    </main>
  )
>>>>>>> Stashed changes
}
