import { buildCreatorProfile } from "@/features/site/creator-profile/profile"
import type { CreatorProfile } from "@/features/site/creator-profile/types"
import { getCreatorById } from "@/features/site/marketplace/data/marketplace-data"

export function getCreatorProfileById(id: string): CreatorProfile | null {
  const creator = getCreatorById(id)
  if (!creator) {
    return null
  }
  return buildCreatorProfile(creator)
}
