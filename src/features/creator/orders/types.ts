export type CreatorOrderStatus =
  | "new"
  | "in_progress"
  | "waiting_on_buyer"
  | "review"
  | "completed"

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
}
