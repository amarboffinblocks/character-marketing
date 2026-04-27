import { CreatorMarketplaceView, sortOptions } from "@/features/site/marketplace"
import { buildTags, getMarketplaceCreators } from "@/features/site/marketplace/data/marketplace-server-data"

export default async function SavedCreatorsPage() {
  const creators = await getMarketplaceCreators()
  const savedCreators = creators.slice(0, 8)
  const tags = buildTags(savedCreators)
  return (
    <CreatorMarketplaceView
      creators={savedCreators}
      categories={tags}
      sortOptions={sortOptions}
    />
  )
}
