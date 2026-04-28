import {
  allCreators,
  categories,
  CreatorMarketplaceView,
  sortOptions,
} from "@/features/site/marketplace"

const savedCreatorIds = ["luna-pixel", "story-sage", "shadow-craft", "aria-writes"] as const
const savedCreatorIdSet = new Set<string>(savedCreatorIds)

const savedCreators = allCreators.filter((creator) => savedCreatorIdSet.has(creator.id))

export default function SavedCreatorsPage() {
  return (
    <CreatorMarketplaceView
      creators={savedCreators}
      categories={categories}
      sortOptions={sortOptions}
    />
  )
}
