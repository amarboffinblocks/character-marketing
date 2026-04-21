import type { PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"

export type BidStatus = "global_bid" | "pending" | "processing" | "completed" | "rejected"
export type BidListTab = "all" | BidStatus

export type BidItem = PostABidFormValues & {
  id: string
  status: BidStatus
  updatedAt: string
  createdAgo: string
}

export const initialBids: BidItem[] = [
  {
    id: "bid-1",
    title: "Anime cyberpunk character set with matching lorebook",
    duration: "7 days",
    budget: "$220",
    tokenCount: "Up to 1200 tokens",
    character: 2,
    persona: 2,
    lorebook: 1,
    background: 1,
    avatar: 2,
    skillsNeeded: "Character design, anime illustration, lore writing",
    description: "Need a full cyberpunk package with expressive portraits and polished lore tone.",
    isPriceNegotiable: true,
    status: "global_bid",
    createdAgo: "Created 2 hours ago by You",
    updatedAt: "Draft - Saved Apr 21, 2026",
  },
  {
    id: "bid-2",
    title: "Fantasy worldbuilding bundle for RPG campaign",
    duration: "10 days",
    budget: "$340",
    tokenCount: "Up to 2000 tokens",
    character: 1,
    persona: 3,
    lorebook: 2,
    background: 2,
    avatar: 1,
    skillsNeeded: "Worldbuilding, fantasy writing, map-style background art",
    description: "Looking for a creator to deliver a premium fantasy setting package.",
    isPriceNegotiable: false,
    status: "processing",
    createdAgo: "Created yesterday by You",
    updatedAt: "In review - Updated Apr 20, 2026",
  },
  {
    id: "bid-3",
    title: "Romance persona + profile art request",
    duration: "5 days",
    budget: "$95",
    tokenCount: "Up to 650 tokens",
    character: 1,
    persona: 2,
    lorebook: 0,
    background: 0,
    avatar: 1,
    skillsNeeded: "Persona writing, profile art, dialogue style tuning",
    description: "Need expressive and warm romantic persona assets with one clean avatar.",
    isPriceNegotiable: true,
    status: "pending",
    createdAgo: "Created 3 days ago by You",
    updatedAt: "Pending responses - Updated Apr 18, 2026",
  },
  {
    id: "bid-4",
    title: "Horror prompt pack and dark background set",
    duration: "8 days",
    budget: "$180",
    tokenCount: "Up to 900 tokens",
    character: 1,
    persona: 1,
    lorebook: 1,
    background: 2,
    avatar: 1,
    skillsNeeded: "Horror writing, prompt engineering, moody visual direction",
    description: "Need dark-fantasy prompts and atmospheric background art assets.",
    isPriceNegotiable: false,
    status: "completed",
    createdAgo: "Created last week by You",
    updatedAt: "Completed - Updated Apr 14, 2026",
  },
]

export const bidTabLabels: Record<BidListTab, string> = {
  all: "All",
  global_bid: "Global Bid",
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  rejected: "Rejected",
}

export function getBidById(id: string) {
  return initialBids.find((bid) => bid.id === id)
}
