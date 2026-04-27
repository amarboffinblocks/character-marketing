export type LorebookSafety = "SFW" | "NSFW"
export type LorebookVisibility = "private" | "public" | "unlisted"

export type LorebookEntry = {
  id: string
  keywords: string
  context: string
}

export type CreatorLorebook = {
  id: string
  lorebookName: string
  description: string
  avatarUrl?: string
  tags: string[]
  safety: LorebookSafety
  visibility: LorebookVisibility
  entries: LorebookEntry[]
  updatedAt: string
}

export const creatorLorebooks: CreatorLorebook[] = [
  {
    id: "lorebook-1",
    lorebookName: "Crimson Harbor Lore",
    description: "Guild politics, trade disputes, and cursed harbor law for city-story continuity.",
    avatarUrl: "",
    tags: ["Fantasy", "Port City", "Political"],
    safety: "SFW",
    visibility: "public",
    updatedAt: "2h ago",
    entries: [
      {
        id: "entry-1",
        keywords: "Crimson Harbor, Harbor Court, Dock Guild",
        context: "Major trade city ruled by three competing guild factions.",
      },
      {
        id: "entry-2",
        keywords: "Night Bell Protocol",
        context: "Curfew protocol after midnight when shadow raiders are active.",
      },
    ],
  },
  {
    id: "lorebook-2",
    lorebookName: "Neon District Memory Pack",
    description: "Underground district memory anchors for neon-noir campaigns and stealth scenes.",
    avatarUrl: "",
    tags: ["Cyberpunk", "Noir"],
    safety: "NSFW",
    visibility: "private",
    updatedAt: "9h ago",
    entries: [
      {
        id: "entry-3",
        keywords: "Sector 9, Ghost Rail",
        context: "Abandoned subway layer used for covert exchanges and hideouts.",
      },
    ],
  },
]
