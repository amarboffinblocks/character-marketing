export type CreatorOrderStatus =
  | "new"
  | "in_progress"
  | "delivered"
  | "approved"
  | "completed"
  | "cancelled"
  | "refunded"
  | "waiting_on_buyer"

export type CreatorOrderPriority = "low" | "medium" | "high"

export type CreatorOrder = {
  id: string
  customerName: string
  packageName: string
  amount: number
  dueDate: string
  dueDateTime: string
  updatedAt: string
  updatedAtTime: string
  status: CreatorOrderStatus
  priority: CreatorOrderPriority
  needsResponse?: boolean
  rawOrderId?: string
  rawStatus?: string
  paymentStatus?: string
  creatorId?: string
  buyerId?: string
  creatorName: string
}
