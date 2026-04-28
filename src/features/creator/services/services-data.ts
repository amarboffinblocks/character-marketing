export type CreatorServicePackage = {
  id: string
  serviceName: string
  description: string
  price: number
  discountedPrice: number | null
  tokensLabel: string
  personaCount: number
  lorebookCount: number
  backgroundCount: number
  avatarCount: number
  characterCount: number
  highlights: string[]
  isRecommended: boolean
  createdAt: string
  updatedAt: string
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}
