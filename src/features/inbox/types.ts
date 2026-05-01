import type { MessageThread } from "@/features/messaging/types"

export type InboxRole = "creator" | "buyer"
export type InboxItemType = "chat" | "system"
export type InboxCategory = "request" | "order" | "message" | "bid" | "payment" | "review"
export type InboxTab = "all" | "messages" | "updates"

export type InboxItem = {
  id: string
  userId: string
  type: InboxItemType
  category: InboxCategory
  title: string
  body: string
  isRead: boolean
  actionUrl: string
  createdAt: string
  counterpartName?: string
  threadId?: string
}

export type InboxSystemSeed = Omit<InboxItem, "id" | "type">

export function mapThreadToInboxItem(thread: MessageThread, role: InboxRole): InboxItem {
  const basePath = role === "creator" ? "/dashboard/creator/inbox" : "/inbox"
  const params = new URLSearchParams({ thread: thread.id, source: "chat" })
  if (thread.orderId) {
    params.set("order", thread.orderId)
  }

  return {
    id: `chat-${thread.id}`,
    userId: role,
    type: "chat",
    category: "message",
    title: thread.counterpartName,
    body: thread.lastMessageText || "New message",
    isRead: thread.unreadCount === 0,
    actionUrl: `${basePath}?${params.toString()}`,
    createdAt: thread.lastMessageAt,
    counterpartName: thread.counterpartName,
    threadId: thread.id,
  }
}
