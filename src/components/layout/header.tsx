"use client"

import Link from "next/link"
import {
  ClipboardList,
  CreditCard,
  LogOut,
  Menu,
  Package,
  Settings,
  UserRound,
  X,
} from "lucide-react"
import { useState } from "react"

import Logo from "@/components/icons/logo"
import { HeaderNotifications } from "@/components/layout/header-notifications"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/creators", label: "Creators" },
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
          <Logo className="h-8 w-auto shrink-0" />
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
          {/* <Link
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
          </Link> */}
          <HeaderNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "size-9 shrink-0 rounded-full"
                  )}
                  aria-label="Account menu"
                >
                  <UserRound className="size-4" aria-hidden />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem render={<Link href="/orders" className="cursor-pointer" />}>
                <ClipboardList className="size-4" />
                My orders
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/transactions" className="cursor-pointer" />}>
                <CreditCard className="size-4" />
                Transactions
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/inventory" className="cursor-pointer" />}>
                <Package className="size-4" />
                Inventory
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/profile" className="cursor-pointer" />}>
                <UserRound className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" className="cursor-pointer" />}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                render={<Link href="/sign-in" className="cursor-pointer" />}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          "overflow-y-auto border-t border-border/60 transition-all duration-200 sm:hidden",
          isMenuOpen ? "max-h-[min(85vh,36rem)] py-4 opacity-100" : "max-h-0 overflow-hidden py-0 opacity-0"
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

        <div className="mt-4 flex flex-col gap-1 border-t border-border/60 pt-4">
          <p className="px-3 text-xs font-medium text-muted-foreground">Account</p>
          <Link
            href="/orders"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={closeMenu}
          >
            My orders
          </Link>
          <Link
            href="/transactions"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={closeMenu}
          >
            Transactions
          </Link>
          <Link
            href="/inventory"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={closeMenu}
          >
            Inventory
          </Link>
          <Link
            href="/profile"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={closeMenu}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={closeMenu}
          >
            Settings
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            onClick={closeMenu}
          >
            Log out
          </Link>
        </div>

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
