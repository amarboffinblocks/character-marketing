import { Construction } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardPlaceholderStateProps = {
  title: string
  description: string
}

export function DashboardPlaceholderState({
  title,
  description,
}: DashboardPlaceholderStateProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <span
          className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <Construction className="size-6" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Section coming soon</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This creator dashboard section is ready for your next feature pass.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
