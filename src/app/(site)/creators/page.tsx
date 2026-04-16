import {
  allCreators,
  categories,
  CreatorMarketplaceView,
  sortOptions,
} from "@/features/site/marketplace"

export default function CreatorsPage() {
  return (
    <CreatorMarketplaceView
      creators={allCreators}
      categories={categories}
      sortOptions={sortOptions}
    />
  )
}
