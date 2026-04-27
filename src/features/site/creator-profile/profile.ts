import { creatorProfileOverrides } from "@/features/site/creator-profile/data/creator-profile-overrides"
import type {
  CreatorProfile,
  CreatorProfileFaqItem,
  CreatorProfileReview,
  CreatorServicePackage,
} from "@/features/site/creator-profile/types"
import type { Creator } from "@/features/site/marketplace/types"

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(31, h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function defaultCompletionRate(creator: Creator): number {
  const base = 92 + (hashString(creator.id) % 8)
  return Math.min(99, base)
}

function defaultBio(creator: Creator): string {
  const focus = creator.specialties.slice(0, 3).join(", ")
  return `I'm ${creator.name}, focused on ${focus}. I've completed ${creator.completedOrders}+ orders with a buyer-first workflow—clear briefs, fast iteration, and deliverables tuned for real sessions.`
}

function defaultPackages(creator: Creator): CreatorServicePackage[] {
  return [
    {
      id: `${creator.id}-starter`,
      title: "Starter Character Card",
      price: creator.startingPrice,
      description:
        "A complete RP-ready character card with personality, voice, and story hooks—structured for your platform and token budget.",
      scopeLabel: "Scope: Best for short RP-ready character cards",
      tokensLabel: "Tokens: Up to 800 tokens",
      deliveryDays: 3,
      revisionCount: 2,
      includedHeading: "WHAT'S INCLUDED",
      includedItems: ["Detailed personality profile", "Structured dialogue samples"],
    },
  ]
}

function defaultReviews(creator: Creator): CreatorProfileReview[] {
  return [
    {
      id: `${creator.id}-r1`,
      authorName: "Buyer",
      rating: Math.min(5, Math.round(creator.rating * 2) / 2),
      body: `${creator.name} nailed the tone and delivered ahead of schedule. Revisions were easy and on-scope.`,
      dateLabel: "2 weeks ago",
    },
    {
      id: `${creator.id}-r2`,
      authorName: "Buyer",
      rating: 5,
      body: "Clear structure, great communication, and the card worked immediately in my workflow.",
      dateLabel: "1 month ago",
    },
  ]
}

function defaultFaq(creator: Creator): CreatorProfileFaqItem[] {
  return [
    {
      id: `${creator.id}-faq-1`,
      question: "What do you need to get started?",
      answer:
        "A short brief on tone, setting, and must-have traits. Links to references are welcome.",
    },
    {
      id: `${creator.id}-faq-2`,
      question: "How do revisions work?",
      answer: `This package includes revision rounds as listed. I keep changes focused and aligned to the agreed scope.`,
    },
  ]
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function defaultMemberSince(creator: Creator): string {
  const y = 2023 + (hashString(creator.id) % 3)
  const m = months[hashString(creator.id + "m") % 12]
  return `${m} ${y}`
}

function defaultPortfolioUrls(creator: Creator): string[] {
  return [creator.coverImage, creator.avatar].filter(Boolean)
}

/**
 * Merges marketplace creator data with optional per-id overrides and sensible defaults.
 */
export function buildCreatorProfile(creator: Creator): CreatorProfile {
  const o = creatorProfileOverrides[creator.id] ?? {}

  const displaySpecialties = o.displaySpecialties ?? [...creator.specialties]
  const packages = o.packages ?? defaultPackages(creator)
  const faqItems = o.faqItems ?? defaultFaq(creator)

  return {
    ...creator,
    bio: o.bio ?? defaultBio(creator),
    location: o.location ?? "Remote",
    memberSinceLabel: o.memberSinceLabel ?? defaultMemberSince(creator),
    completionRate: o.completionRate ?? defaultCompletionRate(creator),
    languages: o.languages ?? (creator.languages.length > 0 ? creator.languages : ["English"]),
    displaySpecialties,
    packages,
    portfolioImageUrls: o.portfolioImageUrls ?? defaultPortfolioUrls(creator),
    reviews: defaultReviews(creator),
    faqItems,
  }
}
