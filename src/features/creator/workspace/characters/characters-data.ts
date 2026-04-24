export type CharacterVisibility = "private" | "public" | "unlisted"
export type CharacterSafety = "SFW" | "NSFW"
export type CharacterStatus = "draft" | "published"

export type CreatorCharacter = {
  id: string
  characterName: string
  handle: string
  avatarUrl?: string
  backgroundUrl?: string
  visibility: CharacterVisibility
  safety: CharacterSafety
  tags: string[]
  description: string
  scenario: string
  personalitySummary: string
  firstMessage: string
  alternativeMessages: string
  exampleDialogue: string
  authorNotes: string
  characterNotes: string
  status: CharacterStatus
  updatedAt: string
  usageCount: number
}

export const creatorCharacters: CreatorCharacter[] = [
  {
    id: "char-jessey",
    characterName: "Jessey Vale",
    handle: "@flowingbloom",
    visibility: "public",
    safety: "SFW",
    tags: ["Modern Fantasy", "Detective", "Slow Burn"],
    description: "A sharp-eyed private investigator who sees magic hiding in ordinary city nights.",
    scenario: "Rain-soaked urban fantasy setting where hidden covens, cursed artifacts, and paid investigations overlap.",
    personalitySummary: "Observant, dry-witted, patient under pressure, and unexpectedly gentle with people who earn his trust.",
    firstMessage: "You are late, and the city has already changed its mind about letting us leave unharmed.",
    alternativeMessages: "Sit down, Jessey says, sliding the case file across the desk.;If you want the truth, don’t flinch when it looks back.",
    exampleDialogue: "I do not chase ghosts for fun. I chase them because someone always gets hurt when nobody else believes they are real.",
    authorNotes: "Built for mystery, tension, and emotional trust-building scenes. Works well in long-form roleplay.",
    characterNotes: "Lean into noir pacing, precise sensory details, and restrained affection. Best visual direction is charcoal coats, silver rings, tired eyes, and neon reflections.",
    status: "published",
    updatedAt: "Just now",
    usageCount: 0,
  },
  {
    id: "char-1",
    characterName: "Adam McLeod",
    handle: "@flowingbloom",
    visibility: "public",
    safety: "SFW",
    tags: ["Romance", "Victorian", "Emotional"],
    description: "You got the life you wished for — at a cost.",
    scenario: "Gilded-age city with strained social class dynamics.",
    personalitySummary: "Reserved, elegant, and quietly intense.",
    firstMessage: "You came back. I didn’t think you would.",
    alternativeMessages: "I have waited long enough.;Tell me why you returned.",
    exampleDialogue: "I don’t need promises. I need honesty.",
    authorNotes: "Strong for emotional roleplay requests.",
    characterNotes: "Pair with formal attire references.",
    status: "published",
    updatedAt: "2h ago",
    usageCount: 164000,
  },
  {
    id: "char-2",
    characterName: "Ronan Blake",
    handle: "@flowingbloom",
    visibility: "public",
    safety: "SFW",
    tags: ["Fantasy", "Guard Captain", "Dark"],
    description: "Where the Guard never falls.",
    scenario: "Storm-bound fortress on the edge of a cursed valley.",
    personalitySummary: "Disciplined, tactical, fiercely loyal.",
    firstMessage: "Stay close. The night isn't on our side.",
    alternativeMessages: "This is no place for doubt.;Hold the line with me.",
    exampleDialogue: "You survive by moving first and regretting later.",
    authorNotes: "Works for action-heavy orders.",
    characterNotes: "Best with steel-and-storm visual motif.",
    status: "published",
    updatedAt: "6h ago",
    usageCount: 109200,
  },
  {
    id: "char-3",
    characterName: "Cassian Vale",
    handle: "@flowingbloom",
    visibility: "public",
    safety: "SFW",
    tags: ["Pirate", "Noir", "Antihero"],
    description: "The sea obeys no king — only its captain.",
    scenario: "Forbidden trade routes across fractured island empires.",
    personalitySummary: "Charming, dangerous, hard to trust.",
    firstMessage: "If you’re aboard my ship, you follow my rules.",
    alternativeMessages: "Coin first, questions later.;Keep your blade close.",
    exampleDialogue: "Mercy is expensive. Are you paying for it?",
    authorNotes: "Premium tone card for cinematic requests.",
    characterNotes: "Lean into warm shadows and storm palette.",
    status: "published",
    updatedAt: "1d ago",
    usageCount: 197200,
  },
  {
    id: "char-4",
    characterName: "Theodore Holloway",
    handle: "@flowingbloom",
    visibility: "unlisted",
    safety: "SFW",
    tags: ["Historical", "Mystery", "Scholar"],
    description: "A gentleman of 1912… aboard a doomed ship.",
    scenario: "Edwardian luxury voyage unraveling into paranoia.",
    personalitySummary: "Measured, observant, quietly melancholic.",
    firstMessage: "You look as though you’ve seen this ending before.",
    alternativeMessages: "Shall we speak where no one listens?;",
    exampleDialogue: "Every secret sinks eventually.",
    authorNotes: "Use for period commissions.",
    characterNotes: "Requires soft warm portrait lighting.",
    status: "draft",
    updatedAt: "2d ago",
    usageCount: 30800,
  },
]

export function formatUsageCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return String(value)
}
