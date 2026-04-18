"use client"

import { useId, useMemo, useState, type ReactNode } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Download,
  FileBarChart,
  LineChart,
  MousePointerClick,
  Percent,
  Search,
  Shield,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  adminConversionFunnel,
  adminExportHistory,
  adminGmvBreakdown,
  adminReportGmvSeries,
  adminReportKpis,
  adminReportTemplates,
  adminTopCreatorsByGmv,
  adminTrustFlagsSeries,
  type AdminExportRun,
} from "@/features/admin/admin-reports-data"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import { cn } from "@/lib/utils"

const exportStatusTone: Record<AdminExportRun["status"], string> = {
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-destructive/15 text-destructive",
  running: "bg-primary/15 text-primary",
}

const exportStatusLabel: Record<AdminExportRun["status"], string> = {
  completed: "Completed",
  failed: "Failed",
  running: "Running",
}

type RangeFilter = "30d" | "90d" | "12m"
type FormatFilter = "all" | AdminExportRun["format"]

export function AdminReportsView() {
  const [range, setRange] = useState<RangeFilter>("30d")
  const [search, setSearch] = useState("")
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all")

  const gmvTotal = useMemo(
    () => adminReportGmvSeries.reduce((a, b) => a + b, 0),
    []
  )

  const filteredExports = useMemo(() => {
    const q = search.trim().toLowerCase()
    return adminExportHistory.filter((row) => {
      const matchesSearch =
        q.length === 0 ||
        row.name.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
      const matchesFormat = formatFilter === "all" ? true : row.format === formatFilter
      return matchesSearch && matchesFormat
    })
  }, [search, formatFilter])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/12 via-primary/5 to-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BarChart3 className="size-5" />
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="w-fit border border-primary/20 bg-primary/10 text-primary">
                Analytics
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Reports
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                GMV, trust, and operational exports — same visual language as finance dashboards. Demo
                data only.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as RangeFilter)}>
              <SelectTrigger className="h-9 w-40 border-primary/25 bg-background/80">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9 border-primary/25 bg-background/80 hover:bg-primary/10">
              <CalendarClock className="size-4" />
              Schedule
            </Button>
            <Button variant="outline" className="h-9 border-primary/25 bg-background/80 hover:bg-primary/10">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminReportKpis.map((kpi) => (
          <ReportMetricCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <ReportGmvAreaChart series={adminReportGmvSeries} total={gmvTotal} rangeLabel={range} />
        <GmvBreakdownCard />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TrustFlagsChart series={adminTrustFlagsSeries} />
        <ConversionFunnelCard steps={adminConversionFunnel} />
      </section>

      <section className="rounded-2xl border border-primary/20 bg-card/80 p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exports by name, ID, or owner"
              className="border-primary/20 bg-background/80 pl-8"
            />
          </div>
          <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as FormatFilter)}>
            <SelectTrigger className="border-primary/20 bg-background/80">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="Parquet">Parquet</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b border-primary/15 pb-4">
          <CardTitle>Export runs</CardTitle>
          <CardDescription>
            Scheduled and on-demand extracts to your warehouse or inbox (illustrative).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead>Report</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExports.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{row.name}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{row.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.format}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.rowCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{row.schedule}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.owner}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.lastRun}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(exportStatusTone[row.status])}>
                        {exportStatusLabel[row.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="divide-y divide-border lg:hidden">
            {filteredExports.map((row) => (
              <li key={row.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{row.id}</p>
                  </div>
                  <Badge variant="secondary" className={cn(exportStatusTone[row.status])}>
                    {exportStatusLabel[row.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{row.format}</Badge>
                  <span>{row.rowCount.toLocaleString()} rows</span>
                  <span>·</span>
                  <span>{row.schedule}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{row.lastRun}</p>
              </li>
            ))}
          </ul>
          {filteredExports.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No exports match your filters.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="border-b border-primary/15 pb-4">
            <CardTitle>Top creators by GMV</CardTitle>
            <CardDescription>Trailing 30 days · demo rankings.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead className="text-right">GMV</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Δ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminTopCreatorsByGmv.map((r) => (
                    <TableRow key={r.creatorId}>
                      <TableCell className="text-muted-foreground">{r.rank}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{r.name}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {r.creatorId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatUsd(r.gmv)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {r.orders}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm tabular-nums",
                          r.delta.startsWith("−")
                            ? "text-destructive"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {r.delta}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y divide-border md:hidden">
              {adminTopCreatorsByGmv.map((r) => (
                <li key={r.creatorId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{formatUsd(r.gmv)}</p>
                  </div>
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      r.delta.startsWith("−")
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {r.delta}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-primary/15 pb-4">
              <div className="flex items-center gap-2">
                <FileBarChart className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Report templates</CardTitle>
              </div>
              <CardDescription>Curated bundles you can subscribe to.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-6">
              {adminReportTemplates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/35"
                >
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-primary">{t.cadence}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

const kpiIcons: Record<string, ReactNode> = {
  "GMV (period)": <BarChart3 className="size-6" />,
  "Net take rate": <Percent className="size-6" />,
  Sessions: <Users className="size-6" />,
  "Checkout conversion": <MousePointerClick className="size-6" />,
}

function ReportMetricCard({ kpi }: { kpi: (typeof adminReportKpis)[number] }) {
  const { label, value, hint, hintTone, emphasis = false } = kpi
  return (
    <Card
      size="sm"
      className={cn(
        "border-border/80 bg-card/80",
        emphasis && "border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-card"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </div>
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            {kpiIcons[label] ?? <BarChart3 className="size-6 opacity-80" />}
          </span>
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "pt-0 text-sm",
          hintTone === "positive" && "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300",
          hintTone === "negative" && "text-rose-600 dark:text-rose-400",
          hintTone === "muted" && "text-muted-foreground"
        )}
      >
        {hint}
      </CardContent>
    </Card>
  )
}

function ReportGmvAreaChart({
  series,
  total,
  rangeLabel,
}: {
  series: number[]
  total: number
  rangeLabel: RangeFilter
}) {
  const gradientId = useId()
  const rangeLabelText =
    rangeLabel === "30d" ? "Last 30 days" : rangeLabel === "90d" ? "Last 90 days" : "Last 12 months"

  const width = 600
  const height = 180
  const paddingX = 16
  const paddingY = 20

  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = max - min || 1

  const points = series.map((value, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(series.length - 1, 1)
    const y = height - paddingY - ((value - min) / range) * (height - paddingY * 2)
    return { x, y }
  })

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ")
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${height - paddingY} L ${polyPoints
          .split(" ")
          .map((p) => p.replace(",", " "))
          .join(" L ")} L ${points[points.length - 1].x},${height - paddingY} Z`
      : ""

  return (
    <Card className="border-primary/20 bg-linear-to-b from-primary/5 to-card">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 border-b border-primary/15 pb-4">
        <div className="space-y-1">
          <CardTitle>GMV trend</CardTitle>
          <CardDescription>{rangeLabelText} · daily series (demo)</CardDescription>
        </div>
        <div className="text-left">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{formatUsd(total)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <ArrowUpRight className="size-3.5" />
            Up vs synthetic prior period
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-44 w-full"
          role="img"
          aria-label="GMV trend chart"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="text-primary">
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyPoints}
            />
          </g>
        </svg>
      </CardContent>
    </Card>
  )
}

function GmvBreakdownCard() {
  const highlight = adminGmvBreakdown.find((r) => r.tone === "highlight")
  return (
    <Card className="border-primary/15 bg-card/90">
      <CardHeader>
        <CardTitle>GMV breakdown</CardTitle>
        <CardDescription>Illustrative waterfall for the selected range.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {adminGmvBreakdown.map((row) => (
          <div
            key={row.label}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border/70 p-3 text-sm",
              row.tone === "highlight" && "bg-primary/5"
            )}
          >
            <div className="flex items-center gap-2">
              {row.amount < 0 ? (
                <ArrowDownRight className="size-4 text-destructive" />
              ) : row.tone === "highlight" ? (
                <ArrowUpRight className="size-4 text-primary" />
              ) : (
                <BarChart3 className="size-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">{row.label}</span>
            </div>
            <span
              className={cn(
                "font-semibold tabular-nums",
                row.amount < 0 && "text-destructive",
                row.tone === "highlight" && "text-foreground"
              )}
            >
              {row.amount < 0 ? "−" : ""}
              {formatUsd(Math.abs(row.amount))}
            </span>
          </div>
        ))}
        {highlight ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Payout window</p>
            <p>
              Net to creators of {formatUsd(highlight.amount)} aligns with batch #89 schedule (demo).
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function TrustFlagsChart({ series }: { series: number[] }) {
  const areaGradientId = useId()
  const width = 400
  const height = 160
  const paddingX = 12
  const paddingY = 16
  const max = Math.max(...series, 0.1)
  const min = Math.min(...series, 0)
  const range = max - min || 1

  const points = series.map((value, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(series.length - 1, 1)
    const y = height - paddingY - ((value - min) / range) * (height - paddingY * 2)
    return { x, y }
  })
  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ")
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${height - paddingY} L ${polyPoints
          .split(" ")
          .map((p) => p.replace(",", " "))
          .join(" L ")} L ${points[points.length - 1].x},${height - paddingY} Z`
      : ""
  const last = series[series.length - 1] ?? 0

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </span>
          <div>
            <CardTitle className="text-base">Trust load</CardTitle>
            <CardDescription>Flags per 1k sessions · weekly</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {last.toFixed(1)} / 1k
        </Badge>
      </CardHeader>
      <CardContent className="pt-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-36 w-full"
          role="img"
          aria-label="Trust flags trend"
        >
          <defs>
            <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="text-primary">
            <path d={areaPath} fill={`url(#${areaGradientId})`} />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyPoints}
            />
          </g>
        </svg>
        <p className="mt-3 text-xs text-muted-foreground">
          Lower is better. Threshold alerts would fire above 2.5 / 1k (not wired).
        </p>
      </CardContent>
    </Card>
  )
}

function ConversionFunnelCard({
  steps,
}: {
  steps: typeof adminConversionFunnel
}) {
  const max = steps[0]?.count ?? 1

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LineChart className="size-5" />
          </span>
          <div>
            <CardTitle className="text-base">Conversion funnel</CardTitle>
            <CardDescription>Session → paid order (demo counts)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {steps.map((s, i) => {
          const widthPct = Math.round((s.count / max) * 100)
          return (
            <div key={s.step}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{s.step}</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.count.toLocaleString()}
                  {i > 0 ? ` (−${s.dropPct}% vs prev)` : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
