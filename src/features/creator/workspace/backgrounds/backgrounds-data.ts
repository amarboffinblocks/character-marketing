export type BackgroundSafety = "SFW" | "NSFW"
export type BackgroundVisibility = "private" | "public" | "unlisted"
export type BackgroundType = "indoor" | "outdoor" | "studio"

export type CreatorBackground = {
  id: string
  backgroundName: string
  imageUrl?: string
  tags: string[]
  safety: BackgroundSafety
  visibility: BackgroundVisibility
  type: BackgroundType
  notes: string
  updatedAt: string
}

export const creatorBackgrounds: CreatorBackground[] = [
  {
    id: "bg-1",
    backgroundName: "Victorian Library Hall",
    imageUrl: "",
    tags: ["Victorian", "Interior", "Warm Light"],
    safety: "SFW",
    visibility: "public",
    type: "indoor",
    notes: "High detail background for historical narratives.",
    updatedAt: "3h ago",
  },
  {
    id: "bg-2",
    backgroundName: "Neon Alley Rain",
    imageUrl: "",
    tags: ["Cyberpunk", "Rain", "Night"],
    safety: "SFW",
    visibility: "unlisted",
    type: "outdoor",
    notes: "Great for dark futuristic roleplay themes.",
    updatedAt: "10h ago",
  },
]
