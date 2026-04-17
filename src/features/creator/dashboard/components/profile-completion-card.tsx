import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type CompletionCheck = {
  label: string
  done: boolean
}

type ProfileCompletionCardProps = {
  checks: CompletionCheck[]
}

export function ProfileCompletionCard({ checks }: ProfileCompletionCardProps) {
  const completed = checks.filter((item) => item.done).length
  const percentage = Math.round((completed / Math.max(checks.length, 1)) * 100)

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Profile completion</CardTitle>
        <CardDescription>Higher completion improves discoverability and buyer trust.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completed} / {checks.length} complete
            </span>
            <span className="font-medium text-foreground">{percentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <ul className="space-y-1.5 text-sm">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2">
              {check.done ? (
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              <span className={check.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard/creator/profile"
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
        >
          Update profile
        </Link>
      </CardContent>
    </Card>
  )
}
