import Link from "next/link"
import { ArrowRight, Shield, Star, Zap } from "lucide-react"

import { Container, TrustChip } from "@/components/elements"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import GridBackground from "../elements/grid-background"

const HERO_TITLE_ID = "hero-heading"

const trustSignals = [
    {
        icon: Shield,
        label: "Protected payments",
        iconClassName: "text-primary",
    },
    {
        icon: Star,
        label: "Verified creators",
        iconClassName: "text-accent",
    },
    {
        icon: Zap,
        label: "Revision guarantee",
        iconClassName: "text-primary",
    },
] as const

export function HeroSection() {
    return (
        <section
            className="relative overflow-hidden bg-linear-to-b from-primary/[0.07] via-background to-background"
            aria-labelledby={HERO_TITLE_ID}
        >
            <GridBackground />

            <Container className="relative" paddingY="lg" size="xl">
                <div className="mx-auto max-w-3xl text-center">
                    <h1
                        className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08]"
                        id={HERO_TITLE_ID}
                    >
                        Commission custom AI characters from{" "}
                        <span className="bg-linear-to-r from-primary to-primary/75 bg-clip-text text-transparent">
                            expert creators
                        </span>
                    </h1>

                    <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
                        Character cards, personas, lorebooks, and more—from people who already
                        speak your niche. Skip the back-and-forth with generic freelancers.
                    </p>

                    <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Link
                            href="/creators"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "h-12 gap-2 px-8 text-base"
                            )}
                        >
                            Browse creators
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                        </Link>
                        <Link
                            href="/sign-up"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "h-12 px-8 text-base"
                            )}
                        >
                            Join as creator
                        </Link>
                    </div>

                    <ul className="mt-14 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-5 sm:px-8">
                        {trustSignals.map(({ icon, label, iconClassName }) => (
                            <li key={label}>
                                <TrustChip icon={icon} iconClassName={iconClassName}>
                                    {label}
                                </TrustChip>
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </section>
    )
}
