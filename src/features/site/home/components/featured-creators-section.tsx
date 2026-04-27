import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container, SectionHeader } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import { CreatorProfileCard } from "@/features/site/marketplace/components/creator-card"
import { getMarketplaceCreators } from "@/features/site/marketplace/data/marketplace-server-data"
import { cn } from "@/lib/utils"

const SECTION_TITLE_ID = "featured-creators-heading"

export async function FeaturedCreatorsSection() {
  const featuredCreators = (await getMarketplaceCreators()).slice(0, 4)

  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="border-t border-border/50 bg-muted/25"
    >
      <Container className="relative" paddingY="md" size="xl">
        <SectionHeader
          titleId={SECTION_TITLE_ID}
          title="Featured creators"
          description="Top-rated specialists ready to bring your characters to life—cards, personas, lore, and more."
          action={
            <Link
              href="/creators"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group -mx-2 h-auto gap-0 px-2 py-2 text-muted-foreground hover:text-foreground"
              )}
            >
              View all creators
              <ArrowRight
                className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />

        <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {featuredCreators.map((creator) => (
            <li key={creator.id}>
              <CreatorProfileCard creator={creator} featured />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
