export type AvatarSafety = "SFW" | "NSFW"
export type AvatarVisibility = "private" | "public" | "unlisted"
export type AvatarStyle = "anime" | "realistic" | "semi-real"

export type CreatorAvatar = {
  id: string
  avatarName: string
  imageUrl?: string
  tags: string[]
  safety: AvatarSafety
  visibility: AvatarVisibility
  style: AvatarStyle
  notes: string
  updatedAt: string
}

export const creatorAvatars: CreatorAvatar[] = [
  {
    id: "avatar-1",
    avatarName: "Noir Hero Portrait",
    imageUrl: "",
    tags: ["Noir", "Male", "Dramatic"],
    safety: "SFW",
    visibility: "public",
    style: "semi-real",
    notes: "Good for emotionally intense character profiles.",
    updatedAt: "2h ago",
  },
  {
    id: "avatar-2",
    avatarName: "Cyber Idol Icon",
    imageUrl: "",
    tags: ["Cyberpunk", "Neon", "Female"],
    safety: "SFW",
    visibility: "unlisted",
    style: "anime",
    notes: "Use for bright modern chat themes and promo covers.",
    updatedAt: "7h ago",
  },
]
