import { buildCreatorProfile } from "@/features/creator-profile/lib/build-creator-profile"
import type { CreatorProfile } from "@/features/creator-profile/model/creator-profile-types"
import { getCreatorById } from "@/features/creator-marketplace/data/creator-marketplace-data"

export function getCreatorProfileById(id: string): CreatorProfile | null {
  const creator = getCreatorById(id)
  if (!creator) {
    return null
  }
  return buildCreatorProfile(creator)
}
