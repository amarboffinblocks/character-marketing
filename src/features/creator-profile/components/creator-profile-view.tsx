import { Container } from "@/components/elements"
import { CreatorProfileHeader } from "@/features/creator-profile/components/creator-profile-header"
import { CreatorProfileStatBar } from "@/features/creator-profile/components/creator-profile-stat-bar"
import { CreatorServicePackageCard } from "@/features/creator-profile/components/creator-service-package-card"
import type { CreatorProfile } from "@/features/creator-profile/model/creator-profile-types"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Star } from "lucide-react"
import { IconTextRow } from "./icon-text-row"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
type CreatorProfileViewProps = {
  profile: CreatorProfile
}
const TABS = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
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
/**
 * Full creator profile layout: hero header, stats, tabbed main column, and packages sidebar.
 */
export function CreatorProfileView({ profile }: CreatorProfileViewProps) {
  const profilePath = `/creators/${profile.id}`
  const mailtoHref = `mailto:support@character.market?subject=${encodeURIComponent(
    `Commission request for ${profile.name}`
  )}`

  return (
    <main className="bg-linear-to-b from-background via-background to-muted/15">
      <CreatorProfileHeader profile={profile} profilePath={profilePath} mailtoHref={mailtoHref} />

      <Container size="xl" className="mt-4 pb-10">
        <CreatorProfileStatBar profile={profile} className="mb-10 shadow-sm" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-12 xl:gap-16">
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
            </Tabs>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Available packages</h2>
              <p className="text-sm text-muted-foreground">
                Pick a predefined package or request a custom scope.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {profile.packages.map((pkg) => (
                <CreatorServicePackageCard key={pkg.id} pkg={pkg} creatorName={profile.name} />
              ))}
            </div>
          </aside>
        </div>
      </Container>

    </main>
  )
}
