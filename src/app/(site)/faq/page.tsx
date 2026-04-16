import Link from "next/link"
import { Mail, MessageSquare } from "lucide-react"

import { Container, SectionHeader } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import { FAQAccordion, faqItems } from "@/features/site/faq"
import { SubHeroSection } from "@/features/site/home"
import { cn } from "@/lib/utils"

const FAQ_TITLE_ID = "faq-page-heading"

export default function FAQPage() {
  return (
    <main className="border-t border-border/40 bg-linear-to-b from-background to-muted/20">
      <SubHeroSection
        eyebrow="Support Center"
        title="Frequently asked questions"
        description="Find quick answers about orders, revisions, trust, pricing, and creator collaboration so you can move from idea to launch with confidence."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ" },
        ]}
      />

      <section aria-labelledby={FAQ_TITLE_ID}>
        <Container size="md" paddingY="md">
          <SectionHeader
            titleId={FAQ_TITLE_ID}
            title="Everything you need to know"
            description="Clear guidance for buyers and creators, from getting started to final delivery."
            align="center"
            className="items-center sm:block"
          />

          <div className="mt-10 rounded-2xl border border-border/70 bg-card p-4 sm:p-6">
            <FAQAccordion items={faqItems} />
          </div>

          <div className="mt-10 grid gap-4 rounded-2xl border border-border/70 bg-background p-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="size-4 text-primary" aria-hidden />
                Need help with an order?
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Contact your creator in the order thread for faster clarification, scope updates, and revision feedback.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="size-4 text-primary" aria-hidden />
                Still have questions?
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team can help with account access, payment concerns, trust checks, and policy guidance.
              </p>
              <Link
                href="mailto:support@charactermarket.example"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                Contact support
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
