import type { ReactNode } from "react"

import { Container } from "@/components/shared"
import GridBackground from "@/components/shared/grid-background"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-primary/5 via-background to-background">
      <GridBackground />
      <section className="relative z-10">
        <Container size="md" paddingY="md">
          {children}
        </Container>
      </section>
    </main>
  )
}
