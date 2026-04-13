export {
  allCreators,
  categories,
  featuredCreators,
  sortOptions,
} from "@/features/creator-marketplace/data/creator-marketplace-data"

// Backward-compatibility exports for older imports.
export const priceRanges = [
  { id: "under-25", label: "Under $25", min: 0, max: 25 },
  { id: "25-50", label: "$25 - $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { id: "over-100", label: "$100+", min: 100, max: Infinity },
]

export const deliveryTimes = [
  { id: "24h", label: "Within 24 hours" },
  { id: "3d", label: "Within 3 days" },
  { id: "7d", label: "Within 7 days" },
  { id: "any", label: "Any time" },
]
