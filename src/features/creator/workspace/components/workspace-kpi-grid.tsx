import Link from "next/link"
import type { ComponentType } from "react"
import { ArrowUpRight, BadgeCheck, Flame, LibraryBig, Rocket, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type WorkspaceKpi = {
  label: string
  value: string
  hint: string
  href: string
  icon: "library" | "publish" | "safety" | "reach" | "drafts"
}

type WorkspaceKpiGridProps = {
  items: WorkspaceKpi[]
}

const iconMap: Record<WorkspaceKpi["icon"], ComponentType<{ className?: string }>> = {
  library: LibraryBig,
  publish: BadgeCheck,
  safety: ShieldCheck,
  reach: Rocket,
  drafts: Flame,
}

export function WorkspaceKpiGrid({ items }: WorkspaceKpiGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = iconMap[item.icon]
        return (
          <Link key={item.label} href={item.href} className="group">
            <Card
              size="sm"
              className="relative overflow-hidden bg-linear-to-br from-primary/8 via-primary/5 to-background transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                  <CardDescription className="text-[11px] uppercase tracking-wide">
                    {item.label}
                  </CardDescription>
                  <CardTitle className="text-3xl leading-none font-semibold tracking-tight text-foreground">
                    {item.value}
                  </CardTitle>
                  </div>
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="size-6" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-1.5 pt-0 text-sm text-muted-foreground">
                <span>{item.hint}</span>
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </section>
  )
}
