import type { CreatorProfileFaqItem, CreatorServicePackage } from "@/features/creator-profile/model/creator-profile-types"

type CreatorProfileOverride = {
  bio?: string
  location?: string
  memberSinceLabel?: string
  completionRate?: number
  languages?: string[]
  displaySpecialties?: string[]
  packages?: CreatorServicePackage[]
  portfolioImageUrls?: string[]
  faqItems?: CreatorProfileFaqItem[]
}

const lunaPackages: CreatorServicePackage[] = [
  {
    id: "starter-card",
    title: "Starter Character Card",
    price: 35,
    description:
      "A focused character card optimized for roleplay and storytelling—clear voice, motivations, and hooks without overwhelming your context window.",
    scopeLabel: "Scope: Best for short RP-ready character cards",
    tokensLabel: "Tokens: Up to 800 tokens",
    deliveryDays: 3,
    revisionCount: 2,
    includedHeading: "WHAT'S INCLUDED",
    includedItems: ["Detailed personality profile", "500 word backstory"],
  },
]

const lunaFaq: CreatorProfileFaqItem[] = [
  {
    id: "luna-faq-1",
    question: "What do you need from me to get started?",
    answer:
      "A short brief on tone, setting, and any must-have traits. Reference characters or media you like also help me match your style.",
  },
  {
    id: "luna-faq-2",
    question: "How do revisions work?",
    answer:
      "Each package includes a set number of revision rounds. Small tweaks within scope are included; major rewrites may need a scope adjustment.",
  },
  {
    id: "luna-faq-3",
    question: "Can you match a specific format?",
    answer:
      "Yes—share the template or platform constraints (token limits, sections) and I will align the deliverable to your workflow.",
  },
]

/**
 * Per-creator rich content. Unspecified keys fall back to `buildCreatorProfile` defaults.
 */
export const creatorProfileOverrides: Record<string, CreatorProfileOverride> = {
  "luna-pixel": {
    bio: "Passionate character designer with 5+ years of experience crafting immersive AI personas and lore-friendly character cards. I focus on voice consistency, memorable hooks, and clean structure so your sessions stay fun—not fiddly.",
    location: "Los Angeles, CA",
    memberSinceLabel: "January 2024",
    completionRate: 99,
    languages: ["English", "Spanish"],
    displaySpecialties: [
      "Character Cards",
      "Personas",
      "Fantasy",
      "Sci-Fi",
      "Romance",
    ],
    packages: lunaPackages,
    portfolioImageUrls: [
      "/portfolio/luna-cover.jpg",
      "/portfolio/marcus-cover.jpg",
      "/portfolio/aria-cover.jpg",
    ],
    faqItems: lunaFaq,
  },
}
