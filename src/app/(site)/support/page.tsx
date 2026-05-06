import { SupportView } from "@/features/site/support/support-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support Center | Character Market",
  description: "Help and support center for Character Market buyers, creators, and administrators.",
}

export default function SupportPage() {
  return (
    <main className="pt-2">
      <SupportView />
    </main>
  )
}
