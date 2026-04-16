import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Shield,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

import { Container, SectionHeader } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const trustFeatures = [
  {
    icon: Shield,
    title: "Protected Payments",
    description: "Funds are held securely until you approve the final delivery.",
  },
  {
    icon: RefreshCw,
    title: "Revision Guarantee",
    description: "Every order includes revisions to ensure your complete satisfaction.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Your data and transactions are protected with enterprise-grade security.",
  },
  {
    icon: UserCheck,
    title: "Verified Creators",
    description: "All creators go through our verification process for quality assurance.",
  },
]

const SECTION_TITLE_ID = "trust-section-heading"

type TrustFeature = {
  icon: LucideIcon
  title: string
  description: string
}

function TrustFeatureCard({ icon: Icon, title, description }: TrustFeature) {
  return (
    <article className="rounded-xl border border-border/70 bg-background p-5 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  )
}

const trustHighlights = [
  "Escrow-style payment protection for every order",
  "Identity and portfolio checks for creators",
  "Dedicated dispute and resolution support",
] as const

export function TrustSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="border-t border-border/40 bg-linear-to-b from-muted/20 via-background to-background"
    >
      <Container paddingY="md" size="xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">Trust &amp; Safety</p>
            <SectionHeader
              titleId={SECTION_TITLE_ID}
              title="Professional safeguards for every order"
              description="Character Market is designed to protect both buyers and creators from first message to final handoff."
              className="mt-2 gap-0"
            />

            <ul className="mt-6 space-y-3">
              {trustHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trust-safety"
                className={cn(buttonVariants({ variant: "outline" }), "h-10")}
              >
                Learn about our policies
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/creators" className={cn(buttonVariants({ variant: "default" }), "h-10")}>
                Browse verified creators
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-center">
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Escrow protected</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24h</p>
                <p className="text-xs text-muted-foreground">Support response</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4-step</p>
                <p className="text-xs text-muted-foreground">Creator verification</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2" role="list">
              {trustFeatures.map((feature) => (
                <div key={feature.title} role="listitem">
                  <TrustFeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
