import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Container, SectionHeader } from "@/components/elements"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SECTION_TITLE_ID = "cta-section-heading"

const highlights = [
  "Verified creators only",
  "Protected payments on every order",
  "Revisions included by default",
] as const

export function CTASection() {
  return (
    <section className="border-t border-primary/10  text-primary-foreground bg-primary">
      <Container paddingY="md" size="xl">
        <div className="">
          <SectionHeader
            titleId={SECTION_TITLE_ID}
            title="Find your perfect creator today"
            description="Commission character cards, personas, and worldbuilding assets from vetted specialists who understand your niche."
            align="center"
            className="items-center text-center sm:block [&_h2]:text-primary-foreground [&_p]:text-primary-foreground/85"
          />

          <ul className="mt-6 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/85">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary-foreground" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/marketplace"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "h-12 px-8 text-base"
              )}
            >
              Browse marketplace
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/for-creators"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-primary-foreground/35 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              Join as creator
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-primary-foreground/70">
            No upfront commitment. Browse portfolios and compare before ordering.
          </p>
            </div>
      </Container>
    </section>
  )
}
