"use client"
import { useMemo } from "react"
import { Container } from "@/components/shared"
import { CreatorProfileHeader } from "@/features/site/creator-profile/components/creator-profile-header"
import { CreatorProfileStatBar } from "@/features/site/creator-profile/components/creator-profile-stat-bar"
import {
  CUSTOM_PACKAGE_FEATURES,
  getCustomPackages,
  getFeatureCount,
  isFeatureIncluded,
} from "@/features/site/packages/package-utils"
import type { CreatorProfile } from "@/features/site/creator-profile/types"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BadgeCheck, Calendar, FileCheck2, MapPin, Plus, Star, UserRound } from "lucide-react"
import { IconTextRow } from "./icon-text-row"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { useCreatorReviewAggregate, useCreatorReviews } from "@/features/reviews/use-creator-reviews"
type CreatorProfileViewProps = {
  profile: CreatorProfile
  isAuthenticated: boolean
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
/**
 * Full creator profile layout: hero header, stats, tabbed main column, and packages sidebar.
 */
export function CreatorProfileView({ profile, isAuthenticated }: CreatorProfileViewProps) {
  const localReviews = useCreatorReviews(profile.id)
  const { averageRating, reviewCount } = useCreatorReviewAggregate({
    creatorId: profile.id,
    baseRating: profile.rating,
    baseCount: profile.reviewCount,
  })
  const mergedReviews = useMemo(() => {
    const mappedLocal = localReviews.map((review) => ({
      id: review.id,
      authorName: review.reviewerName,
      reviewerName: review.reviewerName,
      reviewerInitials: review.reviewerInitials,
      reviewerAvatar: review.reviewerAvatar,
      rating: review.rating,
      title: review.title,
      body: review.body,
      dateLabel: new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -Math.max(1, Math.round((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
        "day"
      ),
      createdAt: review.createdAt,
      status: review.status,
    }))
    return [...mappedLocal, ...profile.reviews]
  }, [localReviews, profile.reviews])
  const profileWithReviewStats = useMemo(
    () => ({
      ...profile,
      rating: averageRating || profile.rating,
      reviewCount,
      reviews: mergedReviews,
    }),
    [averageRating, mergedReviews, profile, reviewCount]
  )
  const profilePath = `/creators/${profile.id}`
  const preselectPackage = profileWithReviewStats.packages[0]
  const displayedCustomPackages = getCustomPackages(profileWithReviewStats.packages, { includeFallback: false })
  const niche = profileWithReviewStats.displaySpecialties.at(-1) ?? ""
  const specialties = niche
    ? profileWithReviewStats.displaySpecialties.slice(0, Math.max(0, profileWithReviewStats.displaySpecialties.length - 1))
    : profileWithReviewStats.displaySpecialties
  const preselectHighlights = preselectPackage
    ? preselectPackage.includedItems.map((item) => item.trim()).filter(Boolean)
    : []

  return (
    <main className="bg-linear-to-b from-background via-background to-muted/15">
      <CreatorProfileHeader profile={profileWithReviewStats} profilePath={profilePath} isAuthenticated={isAuthenticated} />

      <Container size="xl" className="mt-4 pb-10">
        <CreatorProfileStatBar profile={profileWithReviewStats} />

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
                      {profileWithReviewStats.bio}
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                      <IconTextRow icon={MapPin}>{profileWithReviewStats.location}</IconTextRow>
                      <IconTextRow icon={Calendar}>Member since {profileWithReviewStats.memberSinceLabel}</IconTextRow>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Specialties</h3>
                    <ul className="mt-3 flex list-none flex-wrap gap-2">
                      {specialties.map((tag) => (
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

                  {niche ? (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Niche</h3>
                      <ul className="mt-3 flex list-none flex-wrap gap-2">
                        <li>
                          <Badge
                            variant="secondary"
                            className="border-primary/15 bg-primary/8 font-normal text-foreground hover:bg-primary/12"
                          >
                            {niche}
                          </Badge>
                        </li>
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Languages</h3>
                    <ul className="mt-3 flex list-none flex-wrap gap-2">
                    {profileWithReviewStats.languages.map((lang) => (
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
                {profileWithReviewStats.portfolioItems.length > 0 ? (
                  <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {profileWithReviewStats.portfolioItems.map((item) => (
                      <li
                        key={item.id}
                        className="group relative overflow-hidden rounded-4xl border border-white/10 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="relative aspect-4/5 bg-muted">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-black/20" />
                          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/40" />
                        </div>
                        <div className="absolute left-5 top-5">
                          <Badge
                            variant="outline"
                            className="rounded-full border-white/40 bg-white/15 px-3 py-3 text-xs font-semibold tracking-wide text-white capitalize backdrop-blur-sm"
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="max-w-[90%] space-y-3">
                            <h3 className="text-pretty text-[2rem] leading-[1.1] font-semibold text-white">
                              {item.title}
                            </h3>
                            <p className=" text-[1.05rem] leading-relaxed line-clamp-3 text-white/85">
                              {item.description || `${item.category} portfolio highlight`}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No portfolio images yet.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <ul className="space-y-4">
                  {profileWithReviewStats.reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                            {r.reviewerInitials || "BY"}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{r.reviewerName || r.authorName}</p>
                            {r.title ? (
                              <p className="text-sm text-foreground/90">{r.title}</p>
                            ) : null}
                          </div>
                        </div>
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
                  {profileWithReviewStats.faqItems.map((item) => (
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
                          <CardTitle id="preselect-package-heading" className="text-xl font-bold">
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
                          {preselectHighlights.length > 0 ? (
                            <div>
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                {preselectPackage.includedHeading}
                              </p>
                              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                                {preselectHighlights.map((item) => (
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
                          ) : null}
                          <div className="border-t border-border/60 pt-4">
                            <Link
                              href={`/creators/${profileWithReviewStats.id}/purchase-preselect?packageId=${encodeURIComponent(preselectPackage.id)}`}
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
                    {displayedCustomPackages.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        {displayedCustomPackages.map((pkg, index) => {
                          const purchaseCustomHref = `/creators/${profileWithReviewStats.id}/custom-package?packageId=${encodeURIComponent(
                            pkg.id
                          )}`
                          const highlights = (pkg.packageHighlights ?? pkg.includedItems)
                            .map((item) => item.trim())
                            .filter(Boolean)
                          const hasDiscount =
                            typeof pkg.discountedPrice === "number" &&
                            pkg.discountedPrice > 0 &&
                            pkg.discountedPrice < pkg.price
                          return (
                            <motion.div
                              key={pkg.id}
                              className="rounded-xl h-full"
                              animate={pkg.isRecommended ? {
                                boxShadow: [
                                  "0 0 15px -3px rgba(245, 158, 11, 0.15)",
                                  "0 0 30px 0px rgba(245, 158, 11, 0.35)",
                                  "0 0 15px -3px rgba(245, 158, 11, 0.15)"
                                ]
                              } : {}}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Card
                                className={cn(
                                  "relative overflow-hidden border h-full transition-all duration-300",
                                  pkg.isRecommended
                                    ? "border-amber-400/60 bg-linear-to-br from-amber-500/5 via-card to-card dark:from-amber-500/10"
                                    : "border-border/70 bg-card shadow-sm hover:shadow-md"
                                )}
                              >
                                {pkg.isRecommended ? (
                                  <Badge
                                    className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-400/50 hover:bg-amber-500/90"
                                  >
                                    Recommended
                                  </Badge>
                                ) : null}
                                <CardHeader className="space-y-3 ">
                                  <div className="flex flex-col gap-2">
                                    <CardTitle className="text-2xl font-bold">{pkg.title}</CardTitle>
                                    <div>
                                      {hasDiscount ? (
                                        <div className="flex gap-2 ">
                                          <span className="text-sm text-red-700 font-semibold  line-through">
                                            {priceFormatter.format(pkg.price)}
                                          </span>
                                          <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                                            {priceFormatter.format(pkg.discountedPrice!)}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col">
                                          <span className="inline-block text-3xl font-bold tracking-tight tabular-nums">
                                            {priceFormatter.format(pkg.price)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 min-h-[3.25em]">
                                    {pkg.description}
                                  </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <Link
                                    href={purchaseCustomHref}
                                    className={cn(buttonVariants({ size: "lg" }), "w-full")}
                                  >
                                    Purchase Package
                                  </Link>
                                  <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground">{pkg.tokensLabel} Tokens</p>
                                    <div className="relative border-t border-border/60 pt-3">
                                      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] font-semibold tracking-wider text-muted-foreground">
                                        FEATURES
                                      </span>
                                      <ul className="space-y-2">
                                        {CUSTOM_PACKAGE_FEATURES.map((feature) => {
                                          const included = isFeatureIncluded(pkg.includedItems, feature.keywords)
                                          const count = getFeatureCount(pkg.includedItems, feature.keywords)
                                          return (
                                            <li
                                              key={feature.label}
                                              className="flex items-center justify-between gap-3 text-sm"
                                            >
                                              <span className="font-medium text-foreground">{feature.label}</span>
                                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                                {included ? (
                                                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                                                ) : (
                                                  <XCircle className="size-4 text-rose-500" aria-hidden />
                                                )}
                                                {included
                                                  ? `${count} item${count === 1 ? "" : "s"} included`
                                                  : "Not included"}
                                              </span>
                                            </li>
                                          )
                                        })}
                                        {pkg.deliveryDays > 0 ? (
                                          <li className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium text-foreground">Delivery</span>
                                            <span className="text-muted-foreground">
                                              {pkg.deliveryDays} day{pkg.deliveryDays === 1 ? "" : "s"}
                                            </span>
                                          </li>
                                        ) : null}
                                        {pkg.revisionCount > 0 ? (
                                          <li className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium text-foreground">Revisions</span>
                                            <span className="text-muted-foreground">
                                              {pkg.revisionCount} revision{pkg.revisionCount === 1 ? "" : "s"}
                                            </span>
                                          </li>
                                        ) : null}
                                      </ul>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <Card className="border-border/70 bg-card shadow-sm">
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                          No custom packages available for this creator yet.
                        </CardContent>
                      </Card>
                    )}
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
