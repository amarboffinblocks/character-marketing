import type { ReactNode } from "react"

import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
