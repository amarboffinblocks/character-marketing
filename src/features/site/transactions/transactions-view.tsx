"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutGrid,
  XCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { TransactionRow } from "@/features/site/transactions/components/transaction-row"
import {
  filterTransactions,
  formatTransactionAmount,
  siteTransactions,
  transactionStats,
  type TransactionStatus,
} from "@/features/site/transactions/transactions-data"

type TransactionTab = "all" | TransactionStatus

const transactionTabs: SectionTabItem<TransactionTab>[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "rejected", label: "Rejected", icon: XCircle },
]

export function TransactionsView() {
  const [tab, setTab] = useState<TransactionTab>("all")

  const filtered = useMemo(() => filterTransactions(siteTransactions, tab), [tab])

  const stats = useMemo(() => transactionStats(siteTransactions), [])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary">
            <CreditCard className="size-3.5" aria-hidden />
            Payments
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Transactions
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A clear ledger of charges, pending authorizations, and declined attempts—aligned with
            your marketplace activity.
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stats.completedCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {formatTransactionAmount(stats.completedVolumeCents)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300">
              <Clock className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stats.pendingCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {formatTransactionAmount(stats.pendingVolumeCents)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Rejected</p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stats.rejectedCount}
              </p>
              <p className="text-[11px] text-muted-foreground">No funds captured</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTabs value={tab} onChange={setTab} items={transactionTabs} />
          <p className="text-xs text-muted-foreground">
            <ArrowDownLeft className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
            Buyer view · demo data
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No transactions in this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another tab or complete a purchase from a creator storefront.
            </p>
          </div>
        ) : (
          <ul className="flex list-none flex-col gap-3">
            {filtered.map((t) => (
              <li key={t.id}>
                <TransactionRow transaction={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
