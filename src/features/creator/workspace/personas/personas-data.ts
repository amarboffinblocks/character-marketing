export type PersonaVisibility = "private" | "public" | "unlisted"
export type PersonaSafety = "SFW" | "NSFW"

export type CreatorPersona = {
  id: string
  personaName: string
  avatarUrl?: string
  tags: string[]
  safety: PersonaSafety
  visibility: PersonaVisibility
  personaDetails: string
  updatedAt: string
  usageCount: number
}

export const creatorPersonas: CreatorPersona[] = [
  {
    id: "persona-1",
    personaName: "Royal Advisor",
    avatarUrl: "",
    tags: ["Court", "Strategic", "Calm"],
    safety: "SFW",
    visibility: "public",
    personaDetails:
      "Measured and composed voice for high-stakes political or leadership roleplay.",
    updatedAt: "1h ago",
    usageCount: 94200,
  },
  {
    id: "persona-2",
    personaName: "Cyber Noir Narrator",
    avatarUrl: "",
    tags: ["Noir", "Cyberpunk", "Narrative"],
    safety: "SFW",
    visibility: "unlisted",
    personaDetails:
      "Atmospheric storyteller persona with cinematic pacing and visual scene framing.",
    updatedAt: "5h ago",
    usageCount: 31800,
  },
  {
    id: "persona-3",
    personaName: "Possessive Rival",
    avatarUrl: "",
    tags: ["Rivalry", "Romance", "Intense"],
    safety: "NSFW",
    visibility: "private",
    personaDetails:
      "High-tension emotional voice designed for mature dramatic interactions.",
    updatedAt: "1d ago",
    usageCount: 12500,
  },
]

export function formatPersonaUsageCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return String(value)
}
