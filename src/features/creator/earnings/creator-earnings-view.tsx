"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BanknoteArrowUp,
  Download,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  creatorEarningsSeries,
  formatUsd,
  payoutHistory,
  type PayoutStatus,
} from "@/features/creator/earnings/earnings-data"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | PayoutStatus

const statusLabel: Record<PayoutStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
}

const statusTone: Record<PayoutStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  processing: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
}

export function CreatorEarningsView() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [rangeFilter, setRangeFilter] = useState<"30d" | "90d" | "12m">("30d")

  const totals = useMemo(() => {
    const gross = payoutHistory.reduce((acc, txn) => acc + txn.amount, 0)
    const fees = payoutHistory.reduce((acc, txn) => acc + txn.fee, 0)
    const net = payoutHistory.reduce((acc, txn) => acc + txn.net, 0)
    const pending = payoutHistory
      .filter((txn) => txn.status === "pending" || txn.status === "processing")
      .reduce((acc, txn) => acc + txn.net, 0)
    const paid = payoutHistory
      .filter((txn) => txn.status === "paid")
      .reduce((acc, txn) => acc + txn.net, 0)
    const averageOrder = payoutHistory.length === 0 ? 0 : Math.round(gross / payoutHistory.length)
    return { gross, fees, net, pending, paid, averageOrder }
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payoutHistory.filter((txn) => {
      const matchesSearch =
        query.length === 0 ||
        txn.orderId.toLowerCase().includes(query) ||
        txn.buyerName.toLowerCase().includes(query) ||
        txn.packageName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === "all" ? true : txn.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Wallet className="size-5" />
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="w-fit">Finance</Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Earnings
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Monitor revenue trends, pending payouts, and transaction history in one view.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={rangeFilter} onValueChange={(value) => setRangeFilter(value as typeof rangeFilter)}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9">
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Net earnings</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(totals.net)}</CardTitle>
          </CardHeader>
          <CardContent className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <ArrowUpRight className="size-3.5" />
            +18% vs last period
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Pending payout</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(totals.pending)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Clears typically in 3-5 business days
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Paid out</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(totals.paid)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Withdrawn to connected account
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg order value</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(totals.averageOrder)}</CardTitle>
          </CardHeader>
          <CardContent className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <TrendingUp className="size-3.5" />
            Trending up
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <EarningsAreaChart series={creatorEarningsSeries} total={totals.net} label="Last 30 days" />
        <PayoutSummaryCard totals={totals} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order ID, buyer, or package"
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>Detailed breakdown of each order-level payout.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.orderId}</TableCell>
                    <TableCell>{txn.buyerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{txn.packageName}</TableCell>
                    <TableCell className="text-right">{formatUsd(txn.amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      -{formatUsd(txn.fee)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatUsd(txn.net)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("capitalize", statusTone[txn.status])}>
                        {statusLabel[txn.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {filtered.map((txn) => (
              <li key={txn.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{txn.orderId}</p>
                    <p className="text-xs text-muted-foreground">{txn.buyerName}</p>
                  </div>
                  <Badge variant="secondary" className={cn("capitalize", statusTone[txn.status])}>
                    {statusLabel[txn.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{txn.packageName}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Net</span>
                  <span className="font-medium text-foreground">{formatUsd(txn.net)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Gross {formatUsd(txn.amount)}</span>
                  <span>Fee -{formatUsd(txn.fee)}</span>
                  <span>{txn.date}</span>
                </div>
              </li>
            ))}
          </ul>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions match your filters.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function EarningsAreaChart({
  series,
  total,
  label,
}: {
  series: number[]
  total: number
  label: string
}) {
  const width = 600
  const height = 180
  const paddingX = 16
  const paddingY = 20

  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = max - min || 1

  const points = series.map((value, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(series.length - 1, 1)
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
    <Card>
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div className="space-y-1">
          <CardTitle>Revenue trend</CardTitle>
          <CardDescription>{label} · net earnings</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{formatUsd(total)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <ArrowUpRight className="size-3.5" />
            Up from last period
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-44 w-full"
          role="img"
          aria-label="Revenue trend chart"
        >
          <defs>
            <linearGradient id="earningsAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="text-primary">
            <path d={areaPath} fill="url(#earningsAreaGradient)" />
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

function PayoutSummaryCard({
  totals,
}: {
  totals: { gross: number; fees: number; net: number; pending: number; paid: number }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout breakdown</CardTitle>
        <CardDescription>Gross revenue to net payout summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row icon={<ArrowUpRight className="size-4 text-emerald-500" />} label="Gross revenue" value={formatUsd(totals.gross)} />
        <Row icon={<ArrowDownRight className="size-4 text-destructive" />} label="Platform fees" value={`-${formatUsd(totals.fees)}`} />
        <Row icon={<BanknoteArrowUp className="size-4 text-primary" />} label="Net earnings" value={formatUsd(totals.net)} highlight />
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Next payout</p>
          <p>Pending balance of {formatUsd(totals.pending)} will be released to your connected account.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-border/70 p-3 text-sm",
        highlight && "bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className={cn("font-semibold", highlight ? "text-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  )
}
