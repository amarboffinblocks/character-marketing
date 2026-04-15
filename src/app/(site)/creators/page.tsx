import {
  allCreators,
  categories,
  CreatorMarketplaceView,
  sortOptions,
} from "@/features/creator-marketplace"

export default function CreatorsPage() {
  return (
    <CreatorMarketplaceView
      creators={allCreators}
      categories={categories}
      sortOptions={sortOptions}
    />
  )
}