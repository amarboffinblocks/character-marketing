import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorQuickAction } from "@/features/creator/dashboard/types"

type QuickActionsCardProps = {
  actions: CreatorQuickAction[]
}

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>
          Jump back into the most common workflows.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-muted"
          >
            <span>{action.label}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
