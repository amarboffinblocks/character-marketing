"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import { useInboxFeed } from "@/features/inbox/use-inbox-feed"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  const [modPage, setModPage] = useState(1)
  const modPerPage = 5

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

  const modTotalPages = Math.ceil(adminModerationQueue.length / modPerPage)
  const modPaginated = adminModerationQueue.slice(
    (modPage - 1) * modPerPage,
    modPage * modPerPage
  )

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
          <Tabs defaultValue="activity" className="flex flex-col">
            <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Updates & Activity</CardTitle>
                <CardDescription>Live platform activity and system notifications.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <TabsList className="h-8 bg-muted/50 p-1">
                  <TabsTrigger value="activity" className="h-6 px-3 text-xs">Recent activity</TabsTrigger>
                  <TabsTrigger value="notifications" className="h-6 px-3 text-xs">Notifications</TabsTrigger>
                </TabsList>
                <Link
                  href="/dashboard/admin/notifications"
                  className="hidden text-xs font-medium text-primary hover:underline sm:block"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="activity" className="m-0 border-none p-0">
                {liveMetrics.recentActivity.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                    No order activity yet.
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
              </TabsContent>
              <TabsContent value="notifications" className="m-0 border-none p-0">
                <AdminDashboardNotifications role="admin" />
              </TabsContent>
            </CardContent>
          </Tabs>
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
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30 text-xs text-muted-foreground">
                    <TableHead className="px-4 py-3 font-medium">ID</TableHead>
                    <TableHead className="px-4 py-3 font-medium">Type</TableHead>
                    <TableHead className="px-4 py-3 font-medium">Subject</TableHead>
                    <TableHead className="px-4 py-3 font-medium">Source</TableHead>
                    <TableHead className="px-4 py-3 text-right font-medium">Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modPaginated.map((row) => (
                    <TableRow key={row.id} className="hover:bg-accent/20">
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="secondary">{row.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] px-4 py-3 text-foreground">{row.subject}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">{row.reporter}</TableCell>
                      <TableCell className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {row.age}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {modTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-medium">{(modPage - 1) * modPerPage + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(modPage * modPerPage, adminModerationQueue.length)}
                      </span>{" "}
                      of <span className="font-medium">{adminModerationQueue.length}</span>
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            disabled={modPage <= 1}
                            onClick={() => setModPage((p) => Math.max(1, p - 1))}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            disabled={modPage >= modTotalPages}
                            onClick={() => setModPage((p) => Math.min(modTotalPages, p + 1))}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
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

function AdminDashboardNotifications({ role }: { role: "admin" }) {
  const { filteredItems, isLoading, markItemRead } = useInboxFeed(role)

  if (isLoading) return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading notifications...</p>

  if (filteredItems.length === 0) return <p className="px-6 py-10 text-center text-sm text-muted-foreground">No recent notifications.</p>

  return (
    <ul className="divide-y divide-border">
      {filteredItems.slice(0, 5).map((item) => (
        <li key={item.id} className="group relative">
          <Link
            href={item.actionUrl ?? "#"}
            onClick={() => markItemRead(item.id)}
            className={cn(
              "flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/30 sm:px-6",
              !item.isRead && "bg-primary/5"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.body}</p>
            </div>
            {!item.isRead && <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />}
          </Link>
        </li>
      ))}
    </ul>
  )
}
