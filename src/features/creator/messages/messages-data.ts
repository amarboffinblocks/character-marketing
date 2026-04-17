import { creatorOrders } from "@/features/creator/orders/data"
import { getOrderDetailsData } from "@/features/creator/orders/order-details-data"

export type MessageSender = "buyer" | "creator" | "system"

export type CreatorMessage = {
  id: string
  sender: MessageSender
  text: string
  time: string
}

export type CreatorMessageThread = {
  id: string
  orderId: string
  buyerName: string
  packageName: string
  status: "needs_response" | "active" | "waiting" | "closed"
  unreadCount: number
  lastMessageAt: string
  messages: CreatorMessage[]
}

const statusByOrderState: Record<string, CreatorMessageThread["status"]> = {
  new: "needs_response",
  in_progress: "active",
  waiting_on_buyer: "waiting",
  review: "active",
  completed: "closed",
}

export const creatorMessageThreads: CreatorMessageThread[] = creatorOrders.map((order) => {
  const details = getOrderDetailsData(order)
  const status = order.needsResponse ? "needs_response" : statusByOrderState[order.status] ?? "active"
  const unreadCount = order.needsResponse ? 2 : order.status === "new" ? 1 : 0

  return {
    id: `thread-${order.id.toLowerCase()}`,
    orderId: order.id,
    buyerName: order.customerName,
    packageName: order.packageName,
    status,
    unreadCount,
    lastMessageAt: order.updatedAt,
    messages: details.conversation.map((message) => ({
      id: message.id,
      sender: message.sender,
      text: message.text,
      time: message.time,
    })),
  }
})
