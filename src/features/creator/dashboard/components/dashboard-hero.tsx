import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/40 to-background p-6">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
            <Sparkles className="size-3" aria-hidden />
            Creator Studio
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, Creator
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Here&apos;s a snapshot of your marketplace performance and the latest
            activity across your orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/creator/orders"
            className={cn(buttonVariants({ variant: "outline" }), "h-9")}
          >
            View orders
          </Link>
          <Link href="/dashboard/creator" className={cn(buttonVariants(), "h-9")}>
            New listing
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
