import Link from "next/link"
import { LayoutGrid, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type WorkspaceHeroProps = {
  totalAssets: number
  completionPercent: number
  draftsPending: number
  missingPersonas: boolean
}

export function WorkspaceHero({
  totalAssets,
  completionPercent,
  draftsPending,
  missingPersonas,
}: WorkspaceHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/15 via-accent/30 to-background p-5 sm:p-6">
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <LayoutGrid className="size-5" />
          </span>
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
              Creator Workspace
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace Dashboard
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {totalAssets} assets across 5 categories ·{" "}
              <span className="font-medium text-foreground">{completionPercent}% production-ready</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {draftsPending > 0 ? (
            <Link
              href="/dashboard/creator/workspace/characters"
              className={cn(buttonVariants({ variant: "outline" }), "h-9")}
            >
              Publish {draftsPending} draft{draftsPending > 1 ? "s" : ""}
            </Link>
          ) : null}

          {missingPersonas ? (
            <Link
              href="/dashboard/creator/workspace/personas"
              className={cn(buttonVariants(), "h-9")}
            >
              <Sparkles className="size-4" />
              Create first persona
            </Link>
          ) : (
            <Link
              href="/dashboard/creator/workspace/characters/new"
              className={cn(buttonVariants(), "h-9")}
            >
              <Sparkles className="size-4" />
              New character
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
