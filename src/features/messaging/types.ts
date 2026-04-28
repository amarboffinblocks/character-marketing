export type MessageSenderRole = "creator" | "buyer"

export type MessageThreadStatus = "needs_response" | "active"

export type MessageThread = {
  id: string
  orderId: string
  buyerName: string
  creatorName: string
  counterpartName: string
  counterpartAvatarUrl: string
  status: MessageThreadStatus
  unreadCount: number
  lastMessageAt: string
  lastMessageText: string
}

export type MessageItem = {
  id: string
  threadId: string
  senderId: string
  senderRole: MessageSenderRole
  text: string
  createdAt: string
}

export type MessageThreadResponse = {
  threads: MessageThread[]
}

export type MessageListResponse = {
  messages: MessageItem[]
}

export function formatMessageTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatMessageDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
