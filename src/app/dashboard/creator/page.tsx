import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  FilePenLine,
  FolderKanban,
  Layers3,
  MessageCircleMore,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRoundCheck,
  Zap,
} from "lucide-react"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const creatorSnapshot = {
  name: "Avery",
  headline: "Your studio is active across live orders, new buyer inquiries, and storefront growth opportunities.",
  availability: "Available for 3 new projects this week",
  streak: "14-day response streak",
} as const

const stats = [
  {
    label: "Open Orders",
    value: "12",
    detail: "4 due in the next 72 hours",
    icon: FolderKanban,
  },
  {
    label: "New Requests",
    value: "8",
    detail: "3 match your premium packages",
    icon: MessageCircleMore,
  },
  {
    label: "Monthly Earnings",
    value: "$4,280",
    detail: "+18% versus last month",
    icon: CircleDollarSign,
  },
  {
    label: "Profile Completion",
    value: "86%",
    detail: "2 updates away from fully optimized",
    icon: UserRoundCheck,
  },
] as const

const urgentActions = [
  {
    title: "2 orders need delivery confirmation",
    description: "Finalize handoff notes and send files before the client follow-up window opens.",
    href: "/dashboard/creator/orders",
    cta: "View urgent orders",
    priority: "Due soon",
  },
  {
    title: "1 custom request is waiting for approval",
    description: "You already sent the quote. A fast nudge could convert this buyer today.",
    href: "/dashboard/creator/requests",
    cta: "Review request",
    priority: "High value",
  },
  {
    title: "3 buyer replies are still pending",
    description: "Response speed is one of the strongest signals for closing custom work.",
    href: "/dashboard/creator/messages",
    cta: "Open inbox",
    priority: "Needs reply",
  },
  {
    title: "Profile setup is missing 2 proof points",
    description: "Add one portfolio item and refresh availability to improve conversion confidence.",
    href: "/dashboard/creator/profile",
    cta: "Complete profile",
    priority: "Store health",
  },
] as const

const recentRequests = [
  {
    buyer: "Nova Studio",
    requestType: "VTuber model sheet",
    budget: "$450 - $700",
    submittedAt: "18 min ago",
    status: "New",
  },
  {
    buyer: "PixelRaid",
    requestType: "Mascot redesign",
    budget: "$280 package",
    submittedAt: "1 hour ago",
    status: "Needs quote",
  },
  {
    buyer: "LunaCast",
    requestType: "PNGtuber starter bundle",
    budget: "$180 - $260",
    submittedAt: "Today",
    status: "Awaiting reply",
  },
  {
    buyer: "GlowFrame",
    requestType: "Streaming overlay set",
    budget: "$510 package",
    submittedAt: "Yesterday",
    status: "Shortlisted",
  },
] as const

const activeOrders = [
  {
    id: "#ORD-2481",
    buyer: "Nova Studio",
    packageName: "Anime VTuber model sheet",
    dueDate: "Today, 5:00 PM",
    status: "In progress",
  },
  {
    id: "#ORD-2474",
    buyer: "PixelRaid",
    packageName: "Mascot redesign package",
    dueDate: "Tomorrow, 10:30 AM",
    status: "Revision",
  },
  {
    id: "#ORD-2468",
    buyer: "LunaCast",
    packageName: "PNGtuber starter bundle",
    dueDate: "Apr 21",
    status: "Waiting approval",
  },
  {
    id: "#ORD-2461",
    buyer: "GlowFrame",
    packageName: "Streaming overlay illustration set",
    dueDate: "Apr 24",
    status: "Queued",
  },
] as const

const earnings = [
  {
    label: "This month",
    value: "$4,280",
    detail: "+18% month over month",
  },
  {
    label: "Pending payout",
    value: "$1,240",
    detail: "Releasing over 3 completed orders",
  },
  {
    label: "Average order value",
    value: "$356",
    detail: "Up $42 from your 30-day average",
  },
] as const

const storeHealth = [
  {
    label: "Profile completion",
    value: "86%",
    icon: UserRoundCheck,
  },
  {
    label: "Services published",
    value: "6",
    icon: Layers3,
  },
  {
    label: "Portfolio items",
    value: "14",
    icon: Sparkles,
  },
  {
    label: "Average rating",
    value: "4.9",
    icon: Star,
  },
  {
    label: "Response rate",
    value: "97%",
    icon: ShieldCheck,
  },
] as const

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

function getRequestStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "New":
      return "default"
    case "Needs quote":
      return "secondary"
    case "Awaiting reply":
      return "destructive"
    default:
      return "outline"
  }
}

function getOrderStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "In progress":
      return "default"
    case "Revision":
      return "secondary"
    case "Waiting approval":
      return "outline"
    default:
      return "outline"
  }
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border/60 bg-card shadow-none transition-colors hover:bg-muted/20">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-sm font-medium text-muted-foreground">{label}</CardDescription>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

export default function CreatorDashboardPage() {
  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your Character Market studio — orders, requests, and storefront health.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full">
          Last 30 days
        </Button>
      </header>

      <DashboardHeader
        surface="panel"
        variant="compact"
        greeting={`Welcome back, ${creatorSnapshot.name}`}
        title="Stay ahead of deliveries, quotes, and buyer trust."
        description={creatorSnapshot.headline}
        meta={[
          { icon: Zap, label: creatorSnapshot.availability },
          { icon: ShieldCheck, label: creatorSnapshot.streak },
        ]}
        actions={
          <>
            <Link href="/dashboard/creator/services" className={cn(buttonVariants({ size: "default" }))}>
              <Plus className="size-4" aria-hidden />
              Add Service
            </Link>
            <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "outline", size: "default" }))}>
              <FolderKanban className="size-4" aria-hidden />
              View Orders
            </Link>
            <Link href="/dashboard/creator/profile" className={cn(buttonVariants({ variant: "outline", size: "default" }))}>
              <Clock3 className="size-4" aria-hidden />
              Availability
            </Link>
            <Link href="/dashboard/creator/profile" className={cn(buttonVariants({ variant: "outline", size: "default" }))}>
              <FilePenLine className="size-4" aria-hidden />
              Edit Profile
            </Link>
          </>
        }
        aside={
          <Card className="w-full border border-border/60 bg-muted/20 py-0 shadow-none">
            <CardHeader className="border-b border-border/60 py-3">
              <CardTitle className="text-base">Signals</CardTitle>
              <CardDescription className="text-xs">
                Healthy demand and fulfillment — keep nurturing conversion on your storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 py-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-background/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Response time</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">1.8h</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Completion</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">96%</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Store views</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">1.2k</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Close rate</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">32%</p>
              </div>
            </CardContent>
          </Card>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Urgent actions</CardTitle>
            <CardDescription>Prioritize these next to protect delivery quality, conversion speed, and storefront trust.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentActions.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
                      {item.priority}
                    </Badge>
                    <h2 className="font-medium">{item.title}</h2>
                  </div>
                  <p className="max-w-2xl text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Link href={item.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
                  {item.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings snapshot</CardTitle>
            <CardDescription>A quick financial read on this month&apos;s creator performance.</CardDescription>
            <CardAction>
              <Badge variant="secondary" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Trending up
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-linear-to-br from-primary/10 to-accent/20 p-4 ring-1 ring-border/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue momentum</p>
                  <p className="mt-1 text-3xl font-semibold">$4,280</p>
                </div>
                <TrendingUp className="size-5 text-primary" aria-hidden />
              </div>
              <div className="mt-4 h-2 rounded-full bg-background/70">
                <div className="h-2 w-[72%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">72% toward your monthly target</p>
            </div>

            <div className="space-y-3">
              {earnings.map((item) => (
                <div key={item.label} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold">{item.value}</p>
                    </div>
                    <CircleDollarSign className="size-4 text-primary" aria-hidden />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">Higher-value packages are lifting overall revenue quality.</span>
            <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              View order revenue
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
            <CardDescription>Fresh buyer activity that may need qualification, quoting, or a fast reply.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.map((request) => (
              <div key={`${request.buyer}-${request.requestType}`} className="rounded-2xl border bg-muted/20 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{request.buyer}</h2>
                      <Badge variant={getRequestStatusVariant(request.status)}>{request.status}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{request.requestType}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{request.budget}</span>
                      <span>{request.submittedAt}</span>
                    </div>
                  </div>
                  <Link href="/dashboard/creator/requests" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    View
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Link href="/dashboard/creator/requests" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              See all requests
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store health</CardTitle>
            <CardDescription>Your storefront is strong overall, with a few easy wins still available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-linear-to-r from-primary/10 to-accent/10 p-4 ring-1 ring-border/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall storefront score</p>
                  <p className="mt-1 text-3xl font-semibold">8.8/10</p>
                </div>
                <CheckCircle2 className="size-5 text-primary" aria-hidden />
              </div>
            </div>

            {storeHealth.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              )
            })}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">One more portfolio refresh could push profile quality higher.</span>
            <Link href="/dashboard/creator/profile" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Improve profile
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active orders</CardTitle>
            <CardDescription>Current work in motion across delivery, revisions, and buyer approvals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-4 xl:grid xl:grid-cols-[0.9fr_1fr_1.1fr_0.8fr_0.8fr_auto] xl:items-center"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order</p>
                  <p className="mt-1 font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buyer</p>
                  <p className="mt-1 font-medium">{order.buyer}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Package</p>
                  <p className="mt-1 font-medium">{order.packageName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due date</p>
                  <p className="mt-1 font-medium">{order.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <Badge variant={getOrderStatusVariant(order.status)} className="mt-1 w-fit">
                    {order.status}
                  </Badge>
                </div>
                <div className="xl:justify-self-end">
                  <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleAlert className="size-4" aria-hidden />
              <span>2 orders are close to deadline and should be reviewed first today.</span>
            </div>
            <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              View all orders
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
