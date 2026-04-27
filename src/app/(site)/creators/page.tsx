import { CreatorMarketplaceView, sortOptions } from "@/features/site/marketplace"
import { buildTags, getMarketplaceCreators } from "@/features/site/marketplace/data/marketplace-server-data"

export default async function CreatorsPage() {
  const creators = await getMarketplaceCreators()
  const tags = buildTags(creators)

  return (
    <CreatorMarketplaceView
      creators={creators}
      categories={tags}
      sortOptions={sortOptions}
    />
  )
}
