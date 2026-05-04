"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight, FolderKanban, Megaphone, Shield, Store, TrendingUp, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStatsGrid } from "@/features/creator/dashboard/components/dashboard-stats-grid"
import { QuickActionsCard } from "@/features/creator/dashboard/components/quick-actions-card"
import type { CreatorDashboardStat } from "@/features/creator/dashboard/types"
import {
  adminAnnouncements,
  adminEscalations,
  adminModerationQueue,
  adminPlatformHealth,
  adminQuickActions,
  adminRegionalPulse,
  adminVolumeByCategory,
} from "@/features/admin/admin-dashboard-data"
import type { AdminDashboardLiveMetrics } from "@/features/admin/admin-metrics"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
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

function weekDeltaHint(current: number, prior: number): { text: string; trend: "up" | "down" | "neutral" } {
  const d = current - prior
  if (d === 0) return { text: "Flat vs prior week", trend: "neutral" }
  if (d > 0) return { text: `+${d} vs prior week`, trend: "up" }
  return { text: `${d} vs prior week`, trend: "down" }
}

function gmvTrendHint(current: number, prev: number): { text: string; trend: "up" | "down" | "neutral" } {
  if (prev <= 0 && current <= 0) return { text: "No completed GMV in trailing windows", trend: "neutral" }
  if (prev <= 0) return { text: "First completed GMV in window", trend: "up" }
  const pct = ((current - prev) / prev) * 100
  const r = Math.round(pct * 10) / 10
  if (Math.abs(r) < 0.05) return { text: "Flat vs prior 30 days", trend: "neutral" }
  return r > 0
    ? { text: `+${r}% vs prior 30 days`, trend: "up" }
    : { text: `${r}% vs prior 30 days`, trend: "down" }
}

export function AdminDashboardView({ liveMetrics }: { liveMetrics: AdminDashboardLiveMetrics }) {
  const stats = useMemo((): CreatorDashboardStat[] => {
    const buyersW = weekDeltaHint(liveMetrics.buyersJoined7d, liveMetrics.buyersJoinedPrior7d)
    const creatorsW = weekDeltaHint(liveMetrics.creatorsJoined7d, liveMetrics.creatorsJoinedPrior7d)
    const gmvT = gmvTrendHint(liveMetrics.gmv30dUsd, liveMetrics.gmvPrev30dUsd)
    const attn = liveMetrics.ordersNeedingAttention
    const openDelta =
      attn === 0
        ? { text: "No payment or approval holds", trend: "neutral" as const }
        : { text: `${attn} payment / approval holds`, trend: "neutral" as const }

    return [
      {
        label: "Buyers & staff",
        value: liveMetrics.buyerAdminCount.toLocaleString(),
        delta: buyersW.text,
        trend: buyersW.trend,
        icon: Users,
      },
      {
        label: "Creators",
        value: liveMetrics.creatorCount.toLocaleString(),
        delta: creatorsW.text,
        trend: creatorsW.trend,
        icon: Store,
      },
      {
        label: "GMV (30d, completed)",
        value: formatUsd(liveMetrics.gmv30dUsd),
        delta: gmvT.text,
        trend: gmvT.trend,
        icon: TrendingUp,
      },
      {
        label: "Open orders",
        value: liveMetrics.openOrdersCount.toLocaleString(),
        delta: openDelta.text,
        trend: openDelta.trend,
        icon: FolderKanban,
      },
    ]
  }, [liveMetrics])

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        tone="studio"
        icon={Shield}
        badge="Admin console"
        title="Platform overview"
        description="Live counts from profiles and marketplace orders. Supplemental cards below remain illustrative until wired."
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
              Order queue
              <ArrowRight className="size-4" />
            </Link>
          </>
        }
      />

      <DashboardStatsGrid stats={stats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest order status changes (from the orders table).</CardDescription>
            </div>
            <Link
              href="/dashboard/admin/reports"
              className="text-xs font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {liveMetrics.recentActivity.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                No order activity yet. Completed and in-flight orders will appear here as the marketplace grows.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {liveMetrics.recentActivity.map((row) => (
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
            )}
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
