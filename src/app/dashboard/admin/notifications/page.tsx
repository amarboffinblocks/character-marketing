import { Metadata } from "next"
import { InboxView } from "@/features/inbox/components/inbox-view"

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your administrative notifications.",
}

export default function AdminNotificationsPage() {
  return <InboxView role="admin" />
}
