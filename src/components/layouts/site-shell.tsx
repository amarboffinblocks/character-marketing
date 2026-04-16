"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"
import { shouldHideSiteChrome } from "@/lib/site-chrome"

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideChrome = shouldHideSiteChrome(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Header />}
      <div className="flex-1">{children}</div>
      {!hideChrome && <Footer />}
    </div>
  )
}
