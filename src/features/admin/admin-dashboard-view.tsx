import Link from "next/link"
import { ArrowRight, Megaphone, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStatsGrid } from "@/features/creator/dashboard/components/dashboard-stats-grid"
import { QuickActionsCard } from "@/features/creator/dashboard/components/quick-actions-card"
import {
  adminAnnouncements,
  adminDashboardStats,
  adminEscalations,
  adminModerationQueue,
  adminPlatformHealth,
  adminRecentActivity,
  adminQuickActions,
  adminRegionalPulse,
  adminVolumeByCategory,
} from "@/features/admin/admin-dashboard-data"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { cn } from "@/lib/utils"

const severityClass: Record<(typeof adminEscalations)[number]["severity"], string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  low: "bg-muted text-muted-foreground",
}

const healthDot: Record<(typeof adminPlatformHealth)[number]["status"], string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  down: "bg-destructive",
}

export function AdminDashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        tone="studio"
        icon={Shield}
        badge="Admin console"
        title="Platform overview"
        description="Monitor health, trust, and operations across Character Market. Demo data only."
        actions={
          <>
            <Button render={<Link href="/dashboard/admin/users" />}>Review users</Button>
            <Link
              href="/dashboard/admin/reports"
              className={cn(buttonVariants({ variant: "outline" }), "h-8")}
            >
              Open reports
            </Link>
            <Link href="/dashboard/admin/orders" className={cn(buttonVariants({ variant: "ghost" }), "h-8")}>
              View orders
              <ArrowRight className="size-4" />
            </Link>
          </>
        }
      />

      <DashboardStatsGrid stats={adminDashboardStats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Audit-style events across the marketplace.</CardDescription>
            </div>
            <Link
              href="/dashboard/admin/reports"
              className="text-xs font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {adminRecentActivity.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/30 sm:px-6"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{row.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <QuickActionsCard actions={adminQuickActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle>Operations escalations</CardTitle>
            <CardDescription>Items that may need staff attention or comms.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            {adminEscalations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <Badge className={cn("shrink-0 capitalize", severityClass[item.severity])}>
                  {item.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Platform health</CardTitle>
            <CardDescription>Snapshot — not wired to real probes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            {adminPlatformHealth.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className={cn("size-2 shrink-0 rounded-full", healthDot[row.status])} aria-hidden />
                  {row.label}
                </span>
                <span className="font-medium tabular-nums text-foreground">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle>Moderation queue</CardTitle>
            <CardDescription>Oldest open reports first — dummy queue.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 text-right font-medium">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminModerationQueue.map((row) => (
                    <tr key={row.id} className="hover:bg-accent/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{row.type}</Badge>
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-foreground">{row.subject}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.reporter}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {row.age}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start gap-2 border-b pb-4">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Internal notes</CardTitle>
              <CardDescription>Broadcasts and reminders.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6">
            {adminAnnouncements.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>GMV mix by category</CardTitle>
            <CardDescription>Share of orders in the last 30 days (demo).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6">
            {adminVolumeByCategory.map((row) => (
              <div key={row.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{row.category}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.sharePct}% · {row.orders.toLocaleString()} orders
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${row.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Traffic by region</CardTitle>
            <CardDescription>Sessions this week vs prior (illustrative).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            {adminRegionalPulse.map((r) => (
              <div
                key={r.region}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{r.region}</span>
                <div className="text-right text-sm">
                  <span className="font-medium tabular-nums">{r.sessions}</span>
                  <span
                    className={cn(
                      "ml-2 text-xs tabular-nums",
                      r.delta.startsWith("-") ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {r.delta}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
