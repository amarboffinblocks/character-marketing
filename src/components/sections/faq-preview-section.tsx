import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container, SectionHeader } from "@/components/elements"
import { buttonVariants } from "@/components/ui/button"
import { FAQAccordion, faqItems } from "@/features/faq"
import { cn } from "@/lib/utils"

const SECTION_TITLE_ID = "faq-preview-heading"

export function FAQPreviewSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="border-t border-border/40 bg-linear-to-b from-background to-muted/20"
    >
      <Container paddingY="md" size="md">
        <SectionHeader
          titleId={SECTION_TITLE_ID}
          title="Frequently asked questions"
          description="Quick answers to common questions about ordering, trust, and pricing on Character Market."
          align="center"
          className="items-center text-center"
        />

        <div className="mt-10  sm:p-4">
          <FAQAccordion items={faqItems.slice(0, 4)} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className={cn(buttonVariants({ variant: "ghost" }), "h-10")}
          >
            View all FAQs
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  )
}
