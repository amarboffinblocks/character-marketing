import type { CreatorProfile } from "@/features/site/creator-profile/types"
import { getMarketplaceCreatorProfileById } from "@/features/site/marketplace/data/marketplace-server-data"

export async function getCreatorProfileById(id: string): Promise<CreatorProfile | null> {
  return getMarketplaceCreatorProfileById(id)
}
