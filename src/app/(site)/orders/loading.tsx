import { Card } from "@/components/ui/card"

export default function OrdersLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="space-y-2">
          <div className="h-8 w-44 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
          </Card>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-10 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </section>
    </main>
  )
}

