import Link from "next/link"
import { Mail, ShieldCheck } from "lucide-react"

import { Container } from "@/components/elements"

const platformLinks = [
  { href: "/creators", label: "Creators" },
  { href: "/sign-up", label: "Join as Creator" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/trust-safety", label: "Trust & safety" },
] as const

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-accent">
      <Container paddingY="md" size="xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Character Market
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Commission premium AI character cards, personas, and worldbuilding assets
              from verified creators in one trusted marketplace.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" aria-hidden />
              Escrow-protected orders
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Platform</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:support@character.market"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="size-4" aria-hidden />
                  support@character.market
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Character Market. All rights reserved.</p>
          <p>Built for creators and teams shipping memorable AI experiences.</p>
        </div>
      </Container>
    </footer>
  )
}
