import { MarketplaceView } from "@/components/marketplace/marketplace-view"
import { allCreators, categories, sortOptions } from "@/lib/mock-data"

export default function MarketplacePage() {
  return (
    <MarketplaceView
      creators={allCreators}
      categories={categories}
      sortOptions={sortOptions}
    />
  )
}