"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ReceiptText, Timer, TrendingUp, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TransactionRow } from "@/features/transactions/transactions-data"
import { cn } from "@/lib/utils"

type TransactionsViewProps = {
  role: "buyer" | "creator"
  initialTransactions: TransactionRow[]
}

const TRANSACTIONS_PER_PAGE = 12

const transactionStatusClass = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  succeeded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  refunded: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
} as const

function safeCounterparty(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const user = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  const displayName =
    (typeof user?.displayName === "string" && user.displayName.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    ""
  const avatarUrl =
    (typeof user?.avatarUrl === "string" && user.avatarUrl.trim()) ||
    (typeof root?.avatarUrl === "string" && root.avatarUrl.trim()) ||
    ""
  return {
    displayName: displayName || "User",
    avatarUrl: avatarUrl || null,
  }
}

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function TransactionsView({ role, initialTransactions }: TransactionsViewProps) {
  const [transactions] = useState(initialTransactions)
  const [currentPage, setCurrentPage] = useState(1)

  const successfulTotal = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status === "succeeded")
        .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0),
    [transactions]
  )

  const totalPages = Math.max(1, Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * TRANSACTIONS_PER_PAGE
    return transactions.slice(start, start + TRANSACTIONS_PER_PAGE)
  }, [safeCurrentPage, transactions])

  const summaryCards = [
    {
      key: "total",
      title: "Total transactions",
      value: transactions.length,
      note: role === "buyer" ? "All completed and attempted payments" : "All incoming payment records",
      icon: ReceiptText,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "volume",
      title: "Successful volume",
      value: formatCurrency(successfulTotal),
      note: role === "buyer" ? "Total amount you have paid" : "Total amount you have received",
      icon: TrendingUp,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/20",
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
    {
      key: "pending",
      title: "Pending",
      value: transactions.filter((tx) => tx.status === "pending").length,
      note: "Transactions awaiting final state",
      icon: Timer,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
  ] as const

  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8", role === "buyer" ? "pt-24" : "pt-6")}>
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {role === "buyer" ? "Payments & Transactions" : "Transactions"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {role === "buyer"
            ? "Track your payments for creator orders and view transaction history."
            : "Track incoming payments from completed and active customer orders."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-2xl border-border/70 bg-card p-4 shadow-sm",
                "bg-linear-to-br",
                card.bg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg bg-background/80 ring-1 shadow-xs",
                    card.ring
                  )}
                >
                  <Icon className={cn("size-4.5", card.accent)} />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
            </Card>
          )
        })}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <ReceiptText className="size-6" />
            </span>
            <h2 className="text-base font-semibold text-foreground">No transactions yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {role === "buyer" ? "Payments will appear after you pay for orders." : "Incoming payments will appear here once buyers complete payment."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>{role === "buyer" ? "Creator" : "Customer"}</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((tx) => {
                  const counterparty = safeCounterparty(tx.counterpart_profile_data)
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2.5">
                          {counterparty.avatarUrl ? (
                            <img src={counterparty.avatarUrl} alt={counterparty.displayName} className="size-9 rounded-full object-cover shadow-xs" />
                          ) : (
                            <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs" aria-hidden>
                              <UserRound className="size-4.5" />
                            </span>
                          )}
                          <span className="text-sm font-semibold tracking-tight text-foreground">{counterparty.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{tx.package_title}</span>
                          <span className="text-xs text-muted-foreground">#{tx.order_id.slice(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-md", transactionStatusClass[tx.status])}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground capitalize">{tx.payment_method}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.provider_reference || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(Number(tx.amount ?? 0), tx.currency)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      {transactions.length > TRANSACTIONS_PER_PAGE ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(safeCurrentPage - 1) * TRANSACTIONS_PER_PAGE + 1}-
            {Math.min(safeCurrentPage * TRANSACTIONS_PER_PAGE, transactions.length)} of{" "}
            {transactions.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={`transactions-page-${page}`}>
                    <PaginationLink isActive={page === safeCurrentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </main>
  )
}
