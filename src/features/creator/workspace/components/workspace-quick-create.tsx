import Link from "next/link"
import { BookOpenText, ImageIcon, MessageSquareText, Plus, UserSquare2, Users } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const secondaryActions = [
  {
    label: "New Lorebook",
    href: "/dashboard/creator/workspace/lorebooks/new",
    icon: BookOpenText,
  },
  {
    label: "New Avatar",
    href: "/dashboard/creator/workspace/avatars/new",
    icon: UserSquare2,
  },
  {
    label: "New Background",
    href: "/dashboard/creator/workspace/backgrounds/new",
    icon: ImageIcon,
  },
  {
    label: "Manage Personas",
    href: "/dashboard/creator/workspace/personas",
    icon: MessageSquareText,
  },
]

export function WorkspaceQuickCreate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick create</CardTitle>
        <CardDescription>Most used creation flows, at your fingertips.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          render={
            <Link
              href="/dashboard/creator/workspace/characters/new"
              className={cn(
                "group flex h-14 w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 text-left hover:bg-primary/10"
              )}
            />
          }
          variant="ghost"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="size-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">New Character</span>
            <span className="text-[11px] text-muted-foreground">Primary creator flow</span>
          </div>
          <Plus className="ml-auto size-4 text-muted-foreground transition-transform group-hover:scale-110" />
        </Button>

        <div className="grid gap-2 sm:grid-cols-2">
          {secondaryActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start gap-2"
                )}
              >
                <Icon className="size-4" />
                {action.label}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
