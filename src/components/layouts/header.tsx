"use client"

import Link from "next/link"
import { Menu, Sparkles, X } from "lucide-react"
import { useState } from "react"

import { Container } from "@/components/elements"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/creators", label: "Creators" },
  { href: "how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" }

] as const

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (

    <header className="absolute rounded-b-2xl top-0 z-50 left-1/2 -translate-x-1/2 max-w-7xl shadow-sm px-4 sm:px-6 lg:px-8 w-full  bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-wide text-foreground sm:text-base">
            Character Market
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "hidden md:inline-flex"
            )}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "hidden sm:inline-flex")}>
            Join as Creator
          </Link>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-10 sm:hidden"
            )}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border/60 transition-all duration-200 sm:hidden",
          isMenuOpen ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "default" }), "w-full")}

            onClick={closeMenu}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: "default" }), "w-full")}
            onClick={closeMenu}
          >
            Join as Creator
          </Link>
        </div>
      </div>
    </header>
  )
}
