import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Container, SectionHeader } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const benefits = [
  {
    icon: DollarSign,
    title: "Keep 85% of Every Sale",
    description: "Industry-leading commission rates. No hidden fees, transparent pricing.",
  },
  {
    icon: Users,
    title: "Reach Niche Customers",
    description: "Connect with buyers who understand and value your specialized work.",
  },
  {
    icon: BadgeCheck,
    title: "Get Verified",
    description: "Earn trust badges that highlight your expertise and reliability.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Built-in tools for portfolio showcase, pricing packages, and repeat customers.",
  },
]

const SECTION_TITLE_ID = "creator-benefits-heading"

type BenefitItemProps = {
  icon: LucideIcon
  title: string
  description: string
}

function BenefitItem({ icon: Icon, title, description }: BenefitItemProps) {
  return (
    <article className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary-foreground border border-white/10">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="font-semibold text-primary-foreground">{title}</h3>
        <p className="mt-1 text-sm text-primary-foreground/75">{description}</p>
      </div>
    </article>
  )
}

export function CreatorBenefitsSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="bg-linear-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/5 blur-3xl" />
      
      <Container paddingY="lg" size="xl" className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              titleId={SECTION_TITLE_ID}
              title="Turn your character expertise into income"
              description="Join a marketplace built for niche creators. Sell to buyers who value your style and pay for quality."
              className="gap-0 "
            />

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <BenefitItem key={benefit.title} {...benefit} />
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "group"
                )}
              >
                Start selling today
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden border-0 bg-white/95 text-foreground shadow-2xl backdrop-blur">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Average creator earns</p>
                  <p className="mt-2 text-5xl font-bold text-primary">$2,400</p>
                  <p className="mt-1 text-sm text-muted-foreground">per month</p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                    <span className="text-sm font-medium">Character Card</span>
                    <span className="font-mono text-sm text-primary">$35 - $150</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                    <span className="text-sm font-medium">Lorebook Package</span>
                    <span className="font-mono text-sm text-primary">$75 - $300</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                    <span className="text-sm font-medium">Worldbuilding Bundle</span>
                    <span className="font-mono text-sm text-primary">$200 - $500</span>
                  </div>
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Based on top 25% creator earnings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  )
}
