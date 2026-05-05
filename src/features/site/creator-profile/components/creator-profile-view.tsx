"use client"
import { useMemo, useState } from "react"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BadgeCheck, Calendar, FileCheck2, MapPin, MessageSquareText, Pencil, Plus, RefreshCcw, Reply, Star, Trash2, UserRound, X } from "lucide-react"
import { IconTextRow } from "./icon-text-row"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useCreatorReviewAggregate, useCreatorReviews } from "@/features/reviews/use-creator-reviews"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
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
  const [renderedAt] = useState(() => Date.now())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const localReviews = useCreatorReviews(profile.id)

  useEffect(() => {
    if (!isAuthenticated) return
    const supabase = createClientSupabaseClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) setCurrentUserId(user.id)
    })()
  }, [isAuthenticated])
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
      reviewerId: review.reviewerId,
      reviewerInitials: review.reviewerInitials,
      reviewerAvatar: review.reviewerAvatar,
      rating: review.rating,
      title: review.title,
      body: review.body,
      dateLabel: new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -Math.max(1, Math.round((renderedAt - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
        "day"
      ),
      createdAt: review.createdAt,
      status: review.status,
      creatorReply: review.creatorReply,
      creatorRepliedAt: review.creatorRepliedAt,
    }))
    return [...mappedLocal, ...profile.reviews]
  }, [localReviews, profile.reviews, renderedAt])
  const profileWithReviewStats = useMemo(
    () => ({
      ...profile,
      rating: averageRating || profile.rating,
      reviewCount,
      reviews: mergedReviews,
    }),
    [averageRating, mergedReviews, profile, reviewCount]
  )

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/site/reviews/${encodeURIComponent(reviewToDelete)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete review")
      window.location.reload()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete review")
      setIsDeleting(false)
    }
  }

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
                    <h2 id="creator-bio-heading" className="text-lg font-semibold text-foreground">
                      Creater Bio
                    </h2>
                   
                    {profileWithReviewStats.shortBio && (
                      <p className="mb-5 mt-1 text-pretty text-sm  leading-relaxed text-muted-foreground sm:text-base">
                        {profileWithReviewStats.shortBio}
                      </p>
                    )}
                     <h2 id="about-me-heading" className="text-lg font-semibold text-foreground">
                      About Me
                    </h2>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
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
                            className="border-primary/15 p-4 text-black/70 bg-primary/8 font-medium hover:bg-primary/12"
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
                            className="border-primary/15 p-4 text-black/70 bg-primary/8 font-medium hover:bg-primary/12"
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
                          <Badge variant="secondary" className="border-primary/15 p-4 text-black/70 bg-primary/8 font-medium hover:bg-primary/12">
                            {lang}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-4">
                <div className="px-2 pb-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Featured portfolio</h2>
                  <p className="text-sm text-muted-foreground">
                    A showcase of my recent work and character designs.
                  </p>
                </div>

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

              <TabsContent value="reviews" className="mt-4">
                <div className="px-2 pb-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Client reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    Honest feedback from people I've worked with on previous projects.
                  </p>
                </div>

                {profileWithReviewStats.reviews.length > 0 ? (
                  <ul className="space-y-4">
                    {profileWithReviewStats.reviews.map((r) => (
                      <ReviewItem
                        key={r.id}
                        review={r}
                        currentUserId={currentUserId}
                        creatorId={profile.id}
                        onDelete={() => setReviewToDelete(r.id)}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border/60 rounded-xl bg-muted/5">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Star className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No reviews yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      This creator hasn't received any reviews from buyers yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="faq" className="mt-4">
                <div className="px-2 pb-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Frequently asked questions</h2>
                  <p className="text-sm text-muted-foreground">
                    Here are some answers to common questions about my profile and what I offer.
                  </p>
                </div>
                <Accordion defaultValue={[]} className="rounded-xl border border-border/60 bg-card px-2  shadow-sm">
                  {profileWithReviewStats.faqItems.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="py-2">
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
                              className={cn(buttonVariants({ size: "lg" }), "w-full py-5")}
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
                    <div className="flex flex-col  gap-1 py-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Custom Package
                      </h2>
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
                              className="rounded-xl h-full "
                            >
                              <Card
                                className={cn(
                                  "relative flex flex-col border border-border/60 bg-card rounded-[2rem] p-6 shadow-sm transition-all duration-300 hover:shadow-xl h-full",
                                  pkg.isRecommended && "ring-1 ring-primary/10 bg-linear-to-b from-primary/10 to-white/5"
                                )}
                              >
                                 <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/70 via-amber-400/60 to-primary/70" />
                                {pkg.isRecommended ? (
                                  <div className="absolute top-6 right-6">
                                    <Badge variant="secondary" className="bg-primary/80 text-[10px] font-medium text-white px-2 py-0.5 rounded-lg border-none shadow-xs">
                                      Most popular
                                    </Badge>
                                  </div>
                                ) : null}

                                <div className="space-y-6">
                                  <div className="space-y-1.5">
                                    <h4 className="text-base font-semibold text-foreground">{pkg.title}</h4>
                                    <div className="flex items-baseline gap-1">
                                      {hasDiscount ? (
                                        <div className="flex items-baseline gap-2">
                                          <span className="text-4xl font-bold tracking-tight text-foreground">
                                            {priceFormatter.format(pkg.discountedPrice!)}
                                          </span>
                                          <span className="text-sm text-muted-foreground line-through">
                                            {priceFormatter.format(pkg.price)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-4xl font-bold tracking-tight text-foreground">
                                          {priceFormatter.format(pkg.price)}
                                        </span>
                                      )}
                                      <span className="text-sm text-muted-foreground">per package</span>
                                    </div>
                                  </div>

                                  <Link
                                    href={purchaseCustomHref}
                                    className={cn(buttonVariants({ size: "lg" }),
                                      "w-full py-5"
                                    )}
                                  >
                                    Get started
                                  </Link>

                                  <div className="pt-6 border-t border-dashed border-border/80">
                                    <div className="space-y-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                                        FEATURES
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Tailored for {pkg.tokensLabel} projects with:
                                      </p>
                                      <ul className="space-y-3.5">
                                        {CUSTOM_PACKAGE_FEATURES.map((feature) => {
                                          const included = isFeatureIncluded(pkg.includedItems, feature.keywords)
                                          if (!included) return null
                                          const count = getFeatureCount(pkg.includedItems, feature.keywords)
                                          return (
                                            <li
                                              key={feature.label}
                                              className="flex items-start gap-3 text-sm"
                                            >
                                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600">
                                                <CheckCircle2 className="size-3.5" aria-hidden />
                                              </span>
                                              <span className="font-medium text-foreground">
                                                {count > 0 ? `${count}+ ` : ""}{feature.label}
                                              </span>
                                            </li>
                                          )
                                        })}
                                        {pkg.deliveryDays > 0 ? (
                                          <li className="flex items-start gap-3 text-sm">
                                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600">
                                              <CheckCircle2 className="size-3.5" aria-hidden />
                                            </span>
                                            <span className="font-medium text-foreground">
                                              {pkg.deliveryDays} day delivery
                                            </span>
                                          </li>
                                        ) : null}
                                        {pkg.revisionCount > 0 ? (
                                          <li className="flex items-start gap-3 text-sm">
                                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600">
                                              <CheckCircle2 className="size-3.5" aria-hidden />
                                            </span>
                                            <span className="font-medium text-foreground">
                                              {pkg.revisionCount} revisions included
                                            </span>
                                          </li>
                                        ) : null}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
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

      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </DialogDescription>
            {deleteError && (
              <p className="mt-2 text-sm text-destructive">{deleteError}</p>
            )}
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setReviewToDelete(null)
                setDeleteError(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function ReviewItem({
  review,
  currentUserId,
  creatorId,
  onDelete,
}: {
  review: any
  currentUserId: string | null
  creatorId: string
  onDelete: () => void
}) {
  const [isEditingReply, setIsEditingReply] = useState(false)
  const [replyDraft, setReplyDraft] = useState(review.creatorReply || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isCreator = currentUserId === creatorId
  const isReviewer = currentUserId === review.reviewerId
  const canDelete = isCreator || isReviewer
  const canManageReply = isCreator

  const handleUpdateReply = async (newReply: string) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/creator/reviews/${encodeURIComponent(review.id)}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: newReply }),
      })
      if (!res.ok) throw new Error("Failed to update reply")
      window.location.reload()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to update reply")
      setIsSubmitting(false)
    }
  }

  return (
    <li className="rounded-xl border border-border/60 bg-card p-4 shadow-sm group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {review.reviewerInitials || "BY"}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{review.reviewerName || review.authorName}</p>
        <time className="text-xs text-muted-foreground shrink-0">{review.dateLabel}</time>
            
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} />
              <span className="text-xs tabular-nums text-muted-foreground">{review.rating.toFixed(1)}</span>
            </div>
            {/* {review.title && <p className="text-sm font-medium text-foreground">{review.title}</p>} */}
            <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
          </div>
        </div>
          {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={onDelete}
                  title="Delete review"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
      </div>

      {review.creatorReply && !isEditingReply ? (
        <div className="mt-4 rounded-lg bg-muted/30 p-3 border border-border/40 ml-4 relative group/reply">
          <div className="absolute -top-2 left-4 h-2 w-2 rotate-45 border-l border-t border-border/40 bg-muted/30" />
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Reply className="size-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Creator's response</span>
            </div>
            {canManageReply && (
              <div className="flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setIsEditingReply(true)}
                  title="Edit reply"
                >
                  <Pencil className="size-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 hover:text-destructive"
                  onClick={() => {
                    handleUpdateReply("")
                  }}
                  title="Delete reply"
                  disabled={isSubmitting}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{review.creatorReply}"
          </p>
        </div>
      ) : isEditingReply ? (
        <div className="mt-4 ml-4 space-y-2 rounded-lg border border-dashed border-border/80 bg-muted/10 p-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              {review.creatorReply ? <Pencil className="size-3.5" /> : <MessageSquareText className="size-3.5" />}
              {review.creatorReply ? "Edit your reply" : "Reply to this review"}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => {
                setIsEditingReply(false)
                setReplyDraft(review.creatorReply || "")
              }}
            >
              <X className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
          <Textarea
            value={replyDraft}
            onChange={(event) => setReplyDraft(event.target.value)}
            placeholder="Thank the buyer and add context..."
            className="min-h-20 text-sm"
            disabled={isSubmitting}
          />
          {submitError && (
            <p className="text-xs text-destructive mt-1">{submitError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || (review.creatorReply ? false : !replyDraft.trim())}
              onClick={() => handleUpdateReply(replyDraft.trim())}
            >
              {isSubmitting ? (
                <RefreshCcw className="size-3.5 animate-spin" />
              ) : (
                <Reply className="size-3.5" />
              )}
              {review.creatorReply ? "Save changes" : "Publish reply"}
            </Button>
          </div>
        </div>
      ) : isCreator && !review.creatorReply ? (
        <div className="mt-4 ml-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-dashed"
            onClick={() => setIsEditingReply(true)}
          >
            <MessageSquareText className="size-3.5" />
            Reply to review
          </Button>
        </div>
      ) : null}
    </li>
  )
}
