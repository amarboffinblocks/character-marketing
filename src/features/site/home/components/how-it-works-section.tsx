import Link from "next/link"
import { ArrowRight, MessageSquare, Package, Search } from "lucide-react"

import { Container, SectionHeader } from "@/components/shared"
import { Stepper, type Step } from "@/components/shared/stepper"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SECTION_TITLE_ID = "how-it-works-heading"

const steps: Step[] = [
  {
    number: "01",
    title: "Browse & Discover",
    description:
      "Explore verified creators and filter by style, budget, and specialty to find your best fit.",
    icon: Search,
  },
  {
    number: "02",
    title: "Discuss & Customize",
    description:
      "Share your vision, compare quotes, and align on scope, timeline, and deliverables before you commit.",
    icon: MessageSquare,
  },
  {
    number: "03",
    title: "Receive & Review",
    description:
      "Receive your custom assets and request revisions until everything matches your world.",
    icon: Package,
  },
]

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="border-t border-border/50 bg-linear-to-b from-background to-muted/20"
    >
      <Container paddingY="md" size="xl">
        <SectionHeader
          titleId={SECTION_TITLE_ID}
          title="How it works"
          description="Three clear steps from idea to delivery."
          className=" text-center sm:block "
          align="center"
        />

        <Stepper steps={steps} className="mt-14 sm:mt-16" />

        <div className="mt-14 text-center sm:mt-20">
          <Link
            href="/creators"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mx-auto h-12 rounded-xl px-8 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            )}
          >
            Unlock your creation
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  )
}
