export type ServiceTier = "basic" | "standard" | "premium"
export type ServiceStatus = "active" | "draft" | "paused"

export type ServicePackage = {
  id: string
  name: string
  category: string
  description: string
  status: ServiceStatus
  totalOrders: number
  conversionRate: number
  tiers: {
    tier: ServiceTier
    price: number
    deliveryDays: number
    revisions: number
    features: string[]
  }[]
  addOns: {
    id: string
    label: string
    price: number
  }[]
  updatedAt: string
}

export const creatorServices: ServicePackage[] = [
  {
    id: "svc-character-premium",
    name: "Character Premium Package",
    category: "Character",
    description: "Full character card with persona, dialogue style and portrait delivery.",
    status: "active",
    totalOrders: 148,
    conversionRate: 32,
    tiers: [
      {
        tier: "basic",
        price: 120,
        deliveryDays: 5,
        revisions: 1,
        features: ["Base character sheet", "1 headshot variant", "Personality summary"],
      },
      {
        tier: "standard",
        price: 240,
        deliveryDays: 4,
        revisions: 2,
        features: [
          "Full character card",
          "2 portrait variants",
          "Persona + dialogue style",
          "Tag library",
        ],
      },
      {
        tier: "premium",
        price: 420,
        deliveryDays: 3,
        revisions: 3,
        features: [
          "Full character + lorebook link",
          "3 portrait variants",
          "Extended example dialogue",
          "Commercial usage",
        ],
      },
    ],
    addOns: [
      { id: "addon-fast", label: "Fast delivery (24h)", price: 60 },
      { id: "addon-source", label: "Source files", price: 40 },
    ],
    updatedAt: "2h ago",
  },
  {
    id: "svc-lorebook-pack",
    name: "Lorebook Worldbuilding Pack",
    category: "Lorebook",
    description: "Structured lorebook with entries, keywords, and consistent world context.",
    status: "active",
    totalOrders: 64,
    conversionRate: 24,
    tiers: [
      {
        tier: "basic",
        price: 90,
        deliveryDays: 4,
        revisions: 1,
        features: ["5 lorebook entries", "Keyword index", "Basic world outline"],
      },
      {
        tier: "standard",
        price: 180,
        deliveryDays: 4,
        revisions: 2,
        features: [
          "12 lorebook entries",
          "Scene-ready context",
          "Keyword relationship map",
        ],
      },
      {
        tier: "premium",
        price: 320,
        deliveryDays: 5,
        revisions: 3,
        features: [
          "25 entries",
          "Character-linked lore",
          "Extended scenarios",
          "Commercial usage",
        ],
      },
    ],
    addOns: [
      { id: "addon-index", label: "Structured index export", price: 30 },
    ],
    updatedAt: "1d ago",
  },
  {
    id: "svc-avatar-pack",
    name: "Avatar Starter Pack",
    category: "Avatar",
    description: "Reusable avatar set optimized for creator profile and marketplace cards.",
    status: "draft",
    totalOrders: 0,
    conversionRate: 0,
    tiers: [
      {
        tier: "basic",
        price: 40,
        deliveryDays: 3,
        revisions: 1,
        features: ["1 avatar render", "PNG export"],
      },
      {
        tier: "standard",
        price: 80,
        deliveryDays: 3,
        revisions: 2,
        features: ["2 avatar variants", "Transparent PNG", "Minor style tweaks"],
      },
      {
        tier: "premium",
        price: 140,
        deliveryDays: 3,
        revisions: 3,
        features: ["3 avatar variants", "Social crops", "Background palette guide"],
      },
    ],
    addOns: [],
    updatedAt: "5d ago",
  },
]

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}
