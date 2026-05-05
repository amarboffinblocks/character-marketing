import Link from "next/link"
import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SmartHeroProps = {
  creatorName: string
  dueThisWeek: number
  needsResponse: number
  draftsPending: number
}

export function SmartHero({
  creatorName,
  dueThisWeek,
  needsResponse,
  draftsPending,
}: SmartHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/15 via-accent/30 to-background p-6">
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
              Creator Studio
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {creatorName}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              You have <span className="font-medium text-foreground">{dueThisWeek}</span> deliveries due this
              week and <span className="font-medium text-foreground">{needsResponse}</span> buyers waiting on
              a response.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {needsResponse > 0 ? (
            <Button render={<Link href="/dashboard/creator/messages" />}>
              <MessageSquareText className="size-4" />
              Reply to {needsResponse} buyer{needsResponse > 1 ? "s" : ""}
            </Button>
          ) : null}
          {draftsPending > 0 ? (
            <Link
              href="/dashboard/creator/workspace/characters"
              className={cn(buttonVariants({ variant: "outline" }), "h-8")}
            >
              Publish {draftsPending} draft{draftsPending > 1 ? "s" : ""}
            </Link>
          ) : null}
          <Link
            href="/dashboard/creator/orders"
            className={cn(buttonVariants({ variant: "ghost" }), "h-8")}
          >
            View orders
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
