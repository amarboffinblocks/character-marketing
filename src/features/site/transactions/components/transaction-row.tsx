import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { SiteTransaction, TransactionStatus } from "@/features/site/transactions/transactions-data"
import { formatTransactionAmount } from "@/features/site/transactions/transactions-data"
import { cn } from "@/lib/utils"

const statusLabel: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  rejected: "Rejected",
}

const statusStyles: Record<
  TransactionStatus,
  { bar: string; badge: string }
> = {
  completed: {
    bar: "border-l-emerald-600 dark:border-l-emerald-500",
    badge: "border-emerald-600/25 bg-emerald-600/10 text-emerald-800 dark:text-emerald-200",
  },
  pending: {
    bar: "border-l-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  },
  rejected: {
    bar: "border-l-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
}

type TransactionRowProps = {
  transaction: SiteTransaction
}

export function TransactionRow({ transaction: t }: TransactionRowProps) {
  const styles = statusStyles[t.status]

  return (
    <Card
      className={cn(
        "border-l-4 py-0 transition-colors hover:bg-muted/30",
        styles.bar
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
            <Badge variant="outline" className={cn("h-5 text-[10px] font-medium", styles.badge)}>
              {statusLabel[t.status]}
            </Badge>
          </div>
          <p className="font-medium text-foreground">{t.label}</p>
          <p className="text-sm text-muted-foreground">
            {t.creatorName}{" "}
            <span className="text-muted-foreground/80">{t.creatorHandle}</span>
          </p>
          {t.status === "rejected" && t.reason ? (
            <p className="text-sm text-destructive/90">{t.reason}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end sm:text-right">
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {formatTransactionAmount(t.amountCents)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.status === "completed" && t.settledAt
              ? `Settled ${t.settledAt}`
              : t.status === "pending"
                ? `Authorized · ${t.createdAt}`
                : `Attempted ${t.createdAt}`}
          </p>
          {t.status === "completed" ? (
            <p className="text-[11px] text-muted-foreground">Order placed {t.createdAt}</p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
