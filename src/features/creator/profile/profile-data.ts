export type PortfolioType = "character" | "persona" | "lorebook" | "avatar" | "background"

export type PortfolioItem = {
  id: string
  title: string
  type: PortfolioType
  skills: string[]
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
  email: string
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
  displayName: "",
  email: "",
  tagline: "",
  avatarUrl: "",
  bannerUrl: "",
  shortBio: "",
  longBio: "",
  timezone: "",
  responseTime: "",
  languages: [],
  skills: [],
  niche: "",
  contentPreference: "Both",
  profileVisibility: "public",
  responseRate: 0,
  onTimeDelivery: 0,
  repeatBuyerRate: 0,
  socialLinks: [],
  portfolio: [],
  buyerRequirements: "",
  revisionPolicy: "",
  refundPolicy: "",
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
  ]
  const done = checks.filter(Boolean).length
  return {
    completed: done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
  }
}
