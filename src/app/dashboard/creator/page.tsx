import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  MessageSquareText,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Monthly revenue",
    value: "$4,280",
    detail: "+18% from last month",
    icon: CircleDollarSign,
  },
  {
    label: "Active projects",
    value: "12",
    detail: "4 nearing delivery",
    icon: BriefcaseBusiness,
  },
  {
    label: "Unread messages",
    value: "5",
    detail: "2 priority conversations",
    icon: MessageSquareText,
  },
  {
    label: "Average rating",
    value: "4.9",
    detail: "Across 126 reviews",
    icon: Star,
  },
] as const

const priorities = [
  {
    title: "Refresh your storefront packages",
    description: "Update pricing, delivery windows, and featured offers to keep your profile competitive.",
    href: "/dashboard/creator/services",
    cta: "Manage services",
  },
  {
    title: "Respond to high-intent inquiries",
    description: "Fast replies help convert warm leads before they compare multiple creators.",
    href: "/dashboard/creator/messages",
    cta: "Open inbox",
  },
  {
    title: "Tighten your creator profile",
    description: "Add better proof, clearer positioning, and stronger portfolio highlights for trust.",
    href: "/dashboard/creator/profile",
    cta: "Edit profile",
  },
] as const

const deadlines = [
  {
    title: "Finalize anime VTuber package",
    time: "Today, 5:00 PM",
  },
  {
    title: "Send revision preview to Nova Studio",
    time: "Tomorrow, 10:30 AM",
  },
  {
    title: "Review custom brief for mascot redesign",
    time: "Friday, 1:00 PM",
  },
] as const

const activity = [
  "New order confirmed for a streamer avatar bundle.",
  "Client message received about a revision request.",
  "Your profile reached 1.2k impressions this week.",
  "Two new 5-star reviews were added to your storefront.",
] as const

export default function CreatorDashboardPage() {
  return (
    <main className="space-y-6 py-6">
      <section className="overflow-hidden rounded-3xl border bg-linear-to-br from-primary/10 via-background to-accent/20">
        <div className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="w-fit border-0 bg-primary/12 text-primary">
              Creator dashboard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Run your creator business from one clear, professional workspace.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Monitor performance, stay on top of deliverables, and keep your storefront optimized for
                new buyers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/creator/services" className={cn(buttonVariants({ size: "lg" }))}>
                <Sparkles className="size-4" aria-hidden />
                Update services
              </Link>
              <Link
                href="/dashboard/creator/messages"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                <MessageSquareText className="size-4" aria-hidden />
                Check messages
              </Link>
            </div>
          </div>

          <Card className="w-full max-w-md border-0 bg-background/80 py-0 shadow-sm backdrop-blur">
            <CardHeader className="border-b py-4">
              <CardTitle>This week at a glance</CardTitle>
              <CardDescription>Strong momentum with steady demand, healthy ratings, and active conversations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversion</p>
                <p className="mt-2 text-2xl font-semibold">32%</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avg. delivery</p>
                <p className="mt-2 text-2xl font-semibold">3.4 days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription className="flex items-center justify-between gap-3">
                  <span>{stat.label}</span>
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                </CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Priority actions</CardTitle>
            <CardDescription>Small improvements here can lift discoverability, conversions, and buyer trust.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorities.map((item, index) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      0{index + 1}
                    </span>
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
            <CardTitle>Upcoming deadlines</CardTitle>
            <CardDescription>Keep delivery work moving and avoid bottlenecks across active projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadlines.map((item) => (
              <div key={item.title} className="rounded-2xl border p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-xl bg-accent/60 text-accent-foreground">
                    <CalendarClock className="size-4" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">Stay consistent to protect your response score.</span>
            <Link href="/dashboard/creator" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              <TrendingUp className="size-4" aria-hidden />
              Overview
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Important updates across orders, reputation, and buyer communication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-muted/35 p-4">
                <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth focus</CardTitle>
            <CardDescription>Recommended moves to strengthen your creator studio over the next 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-muted/25 p-4">
              <p className="text-sm font-medium">Promote one premium package</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Highlight a higher-value offer to improve average order size.
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/25 p-4">
              <p className="text-sm font-medium">Add stronger visual proof</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Refresh portfolio previews so buyers can judge quality faster.
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/25 p-4">
              <p className="text-sm font-medium">Improve first response speed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Faster replies usually help close more custom request conversations.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
