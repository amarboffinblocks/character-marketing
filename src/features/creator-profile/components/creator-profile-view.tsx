import { Container } from "@/components/elements"
import { CreatorProfileHeader } from "@/features/creator-profile/components/creator-profile-header"
import { CreatorProfileStatBar } from "@/features/creator-profile/components/creator-profile-stat-bar"
import type { CreatorProfile } from "@/features/creator-profile/model/creator-profile-types"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Star } from "lucide-react"
import { IconTextRow } from "./icon-text-row"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
type CreatorProfileViewProps = {
  profile: CreatorProfile
}
const TABS = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "pricing", label: "Pricing" }
] as const

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value)
  const partial = value - full >= 0.5
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && partial
                ? "fill-amber-400/50 text-amber-400"
                : "fill-muted-foreground/25 text-muted-foreground/35"
          )}
        />
      ))}
    </div>
  )
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const CUSTOM_PACKAGE_FEATURES = [
  { label: "Persona", keywords: ["persona"] },
  { label: "Lorebook", keywords: ["lorebook", "lore"] },
  { label: "Background", keywords: ["background"] },
  { label: "Avatar", keywords: ["avatar"] },
  { label: "Character", keywords: ["character"] },
] as const

const DUMMY_CUSTOM_PACKAGES = [
  {
    id: "dummy-custom-starter",
    title: "Custom Story Starter",
    price: 79,
    description: "Great for quick character deployment with core story and visual setup.",
    tokensLabel: "Up to 4K context tokens",
    includedItems: [
      "Persona setup and tone calibration",
      "Lorebook essentials with key world rules",
      "Styled background prompt direction",
      "Avatar style and expression guidance",
      "Character voice and behavior framework",
    ],
  },
  {
    id: "dummy-custom-pro",
    title: "Custom Worldbuilder Pro",
    price: 149,
    description: "Best for creators who need deeper lore, consistency, and premium polish.",
    tokensLabel: "Up to 12K context tokens",
    includedItems: [
      "Advanced persona with relationship logic",
      "Expanded lorebook with factions and timeline",
      "Cinematic background concept pack",
      "Premium avatar art direction notes",
      "Character archetype and progression layers",
    ],
  },
] as const

function isFeatureIncluded(items: readonly string[], keywords: readonly string[]) {
  const normalizedItems = items.map((item) => item.toLowerCase())
  return keywords.some((keyword) => normalizedItems.some((item) => item.includes(keyword)))
}
/**
 * Full creator profile layout: hero header, stats, tabbed main column, and packages sidebar.
 */
export function CreatorProfileView({ profile }: CreatorProfileViewProps) {
  const profilePath = `/creators/${profile.id}`
  const mailtoHref = `mailto:support@character.market?subject=${encodeURIComponent(
    `Commission request for ${profile.name}`
  )}`
  const preselectPackage = profile.packages[0]
  const customPackages = profile.packages.slice(1)
  const displayedCustomPackages = customPackages.length > 0 ? customPackages : DUMMY_CUSTOM_PACKAGES

  return (
    <main className="bg-linear-to-b from-background via-background to-muted/15">
      <CreatorProfileHeader profile={profile} profilePath={profilePath} mailtoHref={mailtoHref} />

      <Container size="xl" className="mt-4 pb-10">
        <CreatorProfileStatBar profile={profile} />

        <div className="grid ">
          <div className="min-w-0">
            <Tabs defaultValue="about" className="w-full flex-col gap-4">
              <TabsList
                aria-label="Creator profile sections"
                className="flex h-auto w-full flex-row flex-nowrap items-center justify-start gap-1 overflow-x-auto p-1"
              >
                {TABS.map(({ id, label }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="h-9 min-w-max flex-none px-4 whitespace-nowrap sm:min-w-0 sm:flex-1"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about">
                <section className="space-y-8" aria-labelledby="about-me-heading">
                  <div>
                    <h2 id="about-me-heading" className="text-lg font-semibold text-foreground">
                      About Me
                    </h2>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {profile.bio}
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                      <IconTextRow icon={MapPin}>{profile.location}</IconTextRow>
                      <IconTextRow icon={Calendar}>Member since {profile.memberSinceLabel}</IconTextRow>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Specialties</h3>
                    <ul className="mt-3 flex list-none flex-wrap gap-2">
                      {profile.displaySpecialties.map((tag) => (
                        <li key={tag}>
                          <Badge
                            variant="secondary"
                            className="border-primary/15 bg-primary/8 font-normal text-foreground hover:bg-primary/12"
                          >
                            {tag}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Languages</h3>
                    <ul className="mt-3 flex list-none flex-wrap gap-2">
                      {profile.languages.map((lang) => (
                        <li key={lang}>
                          <Badge variant="secondary" className="font-normal">
                            {lang}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="portfolio">
                {profile.portfolioImageUrls.length > 0 ? (
                  <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
                    {profile.portfolioImageUrls.map((src, index) => (
                      <li
                        key={`${src}-${index}`}
                        className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm"
                      >
                        <Image
                          src={src}
                          alt={`${profile.name} portfolio piece ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No portfolio images yet.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <ul className="space-y-4">
                  {profile.reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{r.authorName}</p>
                        <time className="text-xs text-muted-foreground">{r.dateLabel}</time>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StarRating value={r.rating} />
                        <span className="text-sm tabular-nums text-muted-foreground">{r.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="faq">
                <Accordion defaultValue={[]} className="rounded-xl border border-border/60 bg-card px-2 shadow-sm">
                  {profile.faqItems.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="px-3 text-left">{item.question}</AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 text-muted-foreground">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="pricing">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Available packages</h2>
                  <p className="text-sm text-muted-foreground">
                    Compare the fixed pre-select package and professional custom package options.
                  </p>
                </div>
                <div className="mt-5 space-y-6">
                  <section className="space-y-3" aria-labelledby="preselect-package-heading">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                        Pre-Select Package
                      </Badge>
                    </div>
                    {preselectPackage ? (
                      <Card className="relative overflow-hidden border-primary/25 bg-linear-to-br from-primary/10 via-card to-card shadow-sm">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/70 via-amber-400/60 to-primary/70" />
                        <CardHeader className="space-y-2 pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary/90">
                              Fixed Scope
                            </Badge>
                            <p className="text-xs text-muted-foreground">Ready to purchase</p>
                          </div>
                          <CardTitle id="preselect-package-heading" className="text-base">
                            {preselectPackage.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{preselectPackage.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Scope
                              </p>
                              <p className="mt-1 text-sm text-foreground">{preselectPackage.scopeLabel}</p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Tokens
                              </p>
                              <p className="mt-1 text-sm text-foreground">{preselectPackage.tokensLabel}</p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Delivery
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {preselectPackage.deliveryDays} day{preselectPackage.deliveryDays === 1 ? "" : "s"}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Revisions
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {preselectPackage.revisionCount} revision
                                {preselectPackage.revisionCount === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                              {preselectPackage.includedHeading}
                            </p>
                            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                              {preselectPackage.includedItems.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-center gap-2 rounded-md border border-border/50 bg-background/70 px-2.5 py-2 text-sm text-foreground"
                                >
                                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border-t border-border/60 pt-4">
                            <Link
                              href={`mailto:support@character.market?subject=${encodeURIComponent(
                                `Purchase ${preselectPackage.title} from ${profile.name}`
                              )}`}
                              className={cn(buttonVariants({ size: "lg" }), "w-full")}
                            >
                              Purchase Pre-Select Package
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-sm text-muted-foreground">No pre-select package available yet.</p>
                    )}
                  </section>

                  <section className="space-y-3" aria-labelledby="custom-package-heading">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500/90">
                        Custom Package
                      </Badge>
                      <p className="text-xs text-muted-foreground">Flexible and tailored package options</p>
                    </div>
                    <h3 id="custom-package-heading" className="sr-only">
                      Custom package cards
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {displayedCustomPackages.map((pkg, index) => {
                        const purchaseCustomHref = `mailto:support@character.market?subject=${encodeURIComponent(
                          `Purchase ${pkg.title} from ${profile.name}`
                        )}`
                        return (
                          <Card
                            key={pkg.id}
                            className={cn(
                              "relative overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                              index === 0
                                ? "border-amber-400/70 bg-linear-to-br from-amber-50/70 via-card to-card dark:from-amber-950/20"
                                : "border-border/70 bg-card"
                            )}
                          >
                            {index === 0 ? (
                              <Badge className="absolute top-4 right-4 bg-amber-500 text-white hover:bg-amber-500/90">
                                Recommended
                              </Badge>
                            ) : null}
                            <CardHeader className="space-y-2 pb-3">
                              <CardTitle className="text-base">{pkg.title}</CardTitle>
                              <p className="text-sm leading-relaxed text-muted-foreground">{pkg.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <dl className="divide-y divide-border/60 rounded-lg border border-border/60 bg-muted/20">
                                <div className="grid grid-cols-2 gap-3 px-3 py-2.5 text-sm">
                                  <dt className="font-medium text-foreground">Price</dt>
                                  <dd className="text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                                    {priceFormatter.format(pkg.price)}
                                  </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-3 px-3 py-2.5 text-sm">
                                  <dt className="font-medium text-foreground">Tokens</dt>
                                  <dd className="text-right text-muted-foreground">{pkg.tokensLabel}</dd>
                                </div>
                                {CUSTOM_PACKAGE_FEATURES.map((feature) => {
                                  const included = isFeatureIncluded(pkg.includedItems, feature.keywords)
                                  return (
                                    <div key={feature.label} className="grid grid-cols-2 gap-3 px-3 py-2.5 text-sm">
                                      <dt className="font-medium text-foreground">{feature.label}</dt>
                                      <dd className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                        {included ? (
                                          <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                                        ) : (
                                          <Circle className="size-4" aria-hidden />
                                        )}
                                        <span>{included ? "Included" : "Available on request"}</span>
                                      </dd>
                                    </div>
                                  )
                                })}
                              </dl>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Package highlights
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                  {pkg.includedItems.map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                                      <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="border-t border-border/60 pt-4">
                                <Link
                                  href={purchaseCustomHref}
                                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                                >
                                  Purchase Package
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {customPackages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Showing professional sample custom packages. Replace these with creator-defined custom packages when available.
                      </p>
                    ) : null}
                  </section>
                </div>
              </TabsContent>
            </Tabs>
          </div>


        </div>
      </Container>

    </main>
  )
}
