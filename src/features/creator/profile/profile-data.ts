export type PortfolioType = "character" | "persona" | "lorebook" | "avatar" | "background"

export type PortfolioItem = {
  id: string
  title: string
  type: PortfolioType
  imageUrl: string
  summary: string
}

export type SocialLink = {
  id: string
  platform: string
  url: string
}

export type ContentPreference = "SFW" | "NSFW" | "Both"
export type ProfileVisibility = "public" | "private"

export type CreatorProfileForm = {
  displayName: string
  handle: string
  tagline: string
  avatarUrl: string
  bannerUrl: string
  shortBio: string
  longBio: string
  timezone: string
  responseTime: string
  languages: string[]
  skills: string[]
  niche: string
  contentPreference: ContentPreference
  profileVisibility: ProfileVisibility
  responseRate: number
  onTimeDelivery: number
  repeatBuyerRate: number
  socialLinks: SocialLink[]
  portfolio: PortfolioItem[]
  buyerRequirements: string
  revisionPolicy: string
  refundPolicy: string
}

export const defaultProfileForm: CreatorProfileForm = {
  displayName: "Rhea Voss",
  handle: "@rheawrites",
  tagline: "Cinematic character packs, emotionally rich personas, and lore-ready worldbuilding.",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  bannerUrl:
    "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=80",
  shortBio:
    "I build premium roleplay assets for fantasy, cyberpunk, and modern drama creators with a focus on consistency and depth.",
  longBio:
    "Hi, I am Rhea. Over the last 4 years I have helped writers, streamers, and indie teams ship memorable character experiences. My process combines narrative structure, emotional arcs, and modular asset design so every package can scale from one-off commissions to long-running universes.",
  timezone: "GMT+5:30 (IST)",
  responseTime: "Typically within 2-4 hours",
  languages: ["English", "Hindi", "Japanese (basic)"],
  skills: ["Character Design", "Dialogue Writing", "Lore Structuring", "Prompt Engineering"],
  niche: "Fantasy, Visual Novel, RP Servers, AI Character Marketplaces",
  contentPreference: "Both",
  profileVisibility: "public",
  responseRate: 98,
  onTimeDelivery: 96,
  repeatBuyerRate: 41,
  socialLinks: [
    { id: "social-1", platform: "X / Twitter", url: "https://x.com/rheawrites" },
    { id: "social-2", platform: "Discord", url: "https://discord.gg/rheastudio" },
    { id: "social-3", platform: "ArtStation", url: "https://www.artstation.com/rheavoss" },
  ],
  portfolio: [
    {
      id: "port-1",
      title: "Astra Kade - Neon Bounty Hunter",
      type: "character",
      imageUrl:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      summary:
        "High-retention cyberpunk character pack with layered personality traits, mission hooks, and dialogue presets.",
    },
    {
      id: "port-2",
      title: "Veloria Court - Political Lorebook",
      type: "lorebook",
      imageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      summary:
        "A faction-rich world bible with timeline anchors, relationship matrices, and continuity-safe canon snippets.",
    },
    {
      id: "port-3",
      title: "Noir Hostess Persona",
      type: "persona",
      imageUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      summary:
        "Multi-tone conversational persona tuned for romance RP and slow-burn narrative pacing.",
    },
  ],
  buyerRequirements:
    "Please share your target genre, audience age rating, preferred tone, and 2-3 reference examples before kickoff.",
  revisionPolicy:
    "Two revision rounds are included for scope-safe edits. Structural rewrites or new requirements are handled as add-ons.",
  refundPolicy:
    "Refunds are available before first draft delivery. After draft submission, partial refunds may be issued based on completed work.",
}

export function computeCompletion(form: CreatorProfileForm) {
  const checks = [
    form.displayName.trim().length > 0,
    form.tagline.trim().length > 10,
    form.shortBio.trim().length > 20,
    form.longBio.trim().length > 60,
    form.skills.length >= 3,
    form.languages.length >= 1,
    form.portfolio.length >= 3,
    form.socialLinks.length >= 1,
    form.buyerRequirements.trim().length > 20,
    form.revisionPolicy.trim().length > 20,
  ]
  const done = checks.filter(Boolean).length
  return {
    completed: done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
  }
}
