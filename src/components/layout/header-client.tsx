"use client"

import Link from "next/link"
import { AlertCircle, ChevronDown, LogOut, Menu, Settings, UserRound, X } from "lucide-react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import Logo from "@/components/icons/logo"
import { HeaderNotifications } from "@/components/layout/header-notifications"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const marketplaceLinks = [
  { href: "/creators", label: "All Creators" },
  { href: "/creators?sort=rating", label: "Top Creators" },
  { href: "/saved-creators", label: "Saved Creators" },
  { href: "/creators", label: "Hired Creators" },
] as const

const activityLinks = [
  { href: "/orders", label: "Orders" },
  { href: "/post-a-bid", label: "Bids & Requests" },
  { href: "/inventory", label: "Inventory" },
] as const

type HeaderClientProps = {
  isAuthenticated: boolean
  showProfileWarning: boolean
  avatarUrl?: string | null
  userRole?: string
}

function ProfileWarningBadge() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex size-4 items-center justify-center rounded-full border border-yellow-200 bg-yellow-400 text-yellow-950 shadow-sm">
            <AlertCircle className="size-2.5" aria-hidden />
          </span>
        }
      />
      <TooltipContent className="border border-border bg-card text-card-foreground shadow-lg">
        <span className="inline-flex items-center gap-1.5">
          <AlertCircle className="size-3 text-yellow-500" aria-hidden />
          Profile is incomplete
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

export function HeaderClient({ isAuthenticated, showProfileWarning, avatarUrl, userRole }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const showCreatorWarning = Boolean(
    showProfileWarning &&
      userRole === "creator" &&
      pathname?.startsWith("/dashboard/creator")
  )

  const closeMenu = () => setIsMenuOpen(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" })
      if (!response.ok) {
        toast.error("Logout failed", { description: "Please try again." })
        return
      }
      toast.success("Logged out successfully")
      router.push("/sign-in")
      router.refresh()
    } catch {
      toast.error("Logout failed", { description: "Please try again." })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="absolute rounded-b-2xl top-0 z-50 left-1/2 -translate-x-1/2 max-w-7xl shadow-sm px-4 sm:px-6 lg:px-8 w-full bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <Logo className="h-8 w-auto shrink-0" />
          <span className="text-sm font-semibold tracking-wide text-foreground sm:text-base">Character Market</span>
        </Link>

        {isAuthenticated ? (
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button type="button" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-sm font-medium text-muted-foreground hover:text-foreground")}>
                    Marketplace
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                }
              />
              <DropdownMenuContent align="center" className="min-w-48">
                {marketplaceLinks.map((link) => (
                  <DropdownMenuItem key={`${link.label}-${link.href}`} render={<Link href={link.href} className="cursor-pointer" />}>
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button type="button" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-sm font-medium text-muted-foreground hover:text-foreground")}>
                    Activity
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                }
              />
              <DropdownMenuContent align="center" className="min-w-48">
                {activityLinks.map((link) => (
                  <DropdownMenuItem key={`${link.label}-${link.href}`} render={<Link href={link.href} className="cursor-pointer" />}>
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/messages" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
            <Link href="/faq" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <HeaderNotifications />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button type="button" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative size-9 shrink-0 rounded-full overflow-hidden")} aria-label="Account menu">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="size-full object-cover" />
                      ) : (
                        <UserRound className="size-4" aria-hidden />
                      )}
                      {showCreatorWarning ? (
                        <span className="absolute -right-0.5 -top-0.5">
                          <ProfileWarningBadge />
                        </span>
                      ) : null}
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-56 p-2">
                  <DropdownMenuItem className="flex justify-between" render={<Link href="/profile" className="cursor-pointer" />}>
                    <span className="flex gap-2 items-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="size-5 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <UserRound className="size-4 flex-shrink-0" />
                      )}
                      Profile
                    </span>
                    {showCreatorWarning ? (
                      <span>
                        <ProfileWarningBadge />
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" className="cursor-pointer" />}><Settings className="size-4" />Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut} disabled={isSigningOut}>
                    <LogOut className="size-4" />
                    {isSigningOut ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "hidden md:inline-flex")}>Sign in</Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "hidden sm:inline-flex")}>Join as Creator</Link>
            </>
          )}

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10 sm:hidden")}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={cn("overflow-y-auto border-t border-border/60 transition-all duration-200 sm:hidden", isMenuOpen ? "max-h-[min(85vh,36rem)] py-4 opacity-100" : "max-h-0 overflow-hidden py-0 opacity-0")}>
        {isAuthenticated ? (
          <>
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              <p className="px-3 pt-1 text-xs font-medium text-muted-foreground">Marketplace</p>
              {marketplaceLinks.map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>{link.label}</Link>
              ))}
              <p className="mt-3 px-3 pt-1 text-xs font-medium text-muted-foreground">Activity</p>
              {activityLinks.map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>{link.label}</Link>
              ))}
              <Link href="/messages" className="mt-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>Messages</Link>
              <Link href="/faq" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>FAQ</Link>
            </nav>
            <div className="mt-4 flex flex-col gap-1 border-t border-border/60 pt-4">
              <p className="px-3 text-xs font-medium text-muted-foreground">Account</p>
              <Link href="/profile" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>Profile</Link>
              <Link href="/settings" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" onClick={closeMenu}>Settings</Link>
              <button type="button" onClick={async () => { closeMenu(); await handleSignOut() }} className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                {isSigningOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "default" }), "w-full")} onClick={closeMenu}>Sign in</Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: "default" }), "w-full")} onClick={closeMenu}>Join as Creator</Link>
        </div>
      </div>
    </header>
  )
}
