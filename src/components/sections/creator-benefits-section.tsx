import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Container, SectionHeader } from "@/components/elements"
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
    <article className="flex gap-4 rounded-xl border border-white/10 bg-white/4 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{description}</p>
      </div>
    </article>
  )
}

export function CreatorBenefitsSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="bg-foreground text-background"
    >
      <Container paddingY="md" size="xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              titleId={SECTION_TITLE_ID}
              title="Turn your character expertise into income"
              description="Join a marketplace built for niche creators. Sell to buyers who value your style and pay for quality."
              className="gap-0"
            />

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <BenefitItem key={benefit.title} {...benefit} />
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/for-creators"
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
            <Card className="overflow-hidden border-0 bg-white/6 text-white backdrop-blur">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm text-white/65">Average creator earns</p>
                  <p className="mt-2 text-5xl font-bold text-white">$2,400</p>
                  <p className="mt-1 text-sm text-white/65">per month</p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
                    <span className="text-sm">Character Card</span>
                    <span className="font-mono text-sm">$35 - $150</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
                    <span className="text-sm">Lorebook Package</span>
                    <span className="font-mono text-sm">$75 - $300</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
                    <span className="text-sm">Worldbuilding Bundle</span>
                    <span className="font-mono text-sm">$200 - $500</span>
                  </div>
                </div>
                <p className="mt-6 text-center text-xs text-white/60">
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
