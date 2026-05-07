import type { PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"

export type BidStatus = "global_bid" | "pending" | "processing" | "completed" | "rejected"
export type BidListTab = "all" | BidStatus

export type BidPerson = {
  id: string
  name: string
  handle: string
  avatarUrl: string
  email: string
  proposedPrice?: string
  message?: string
}

export type BidItem = PostABidFormValues & {
  id: string
  status: BidStatus
  createdAt: string
  updatedAt: string
  interestedCount: number
  interestedCreators: BidPerson[]
  assignedCreator: BidPerson | null
  requestPayload: Record<string, unknown>
}

export const bidTabLabels: Record<BidListTab, string> = {
  all: "All",
  global_bid: "Global Bid",
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  rejected: "Rejected",
}
