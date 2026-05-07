"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FolderSearch } from "lucide-react"

import { createClientSupabaseClient } from "@/lib/supabase/client"
import { buttonVariants } from "@/components/ui/button"
import { OrdersClientTable } from "./orders-client-table"
import { cn } from "@/lib/utils"

type OrderStatus =
  | "pending_payment"
  | "funded"
  | "in_progress"
  | "on_hold"
  | "delivered"
  | "approved"
  | "completed"
  | "cancelled"
  | "refunded"
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded"

type BuyerOrderRow = {
  id: string
  request_id: string
  creator_id: string
  buyer_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
  request_snapshot: unknown
  creator_profile_data: unknown | null
}

export function OrdersLiveView({
  initialOrders,
  userId,
}: {
  initialOrders: BuyerOrderRow[]
  userId: string
}) {
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const [orders, setOrders] = useState(initialOrders)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    async function refreshOrders() {
      const response = await fetch("/api/site/orders", { cache: "no-store" })
      const json = (await response.json().catch(() => ({}))) as { orders?: BuyerOrderRow[] }
      if (!response.ok || !Array.isArray(json.orders)) return
      setOrders(json.orders)
    }

    const channel = supabase
      .channel(`buyer-orders:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `buyer_id=eq.${userId}`,
        },
        () => {
          void refreshOrders()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: `requester_id=eq.${userId}`,
        },
        () => {
          void refreshOrders()
        }
      )
      .subscribe()

    const intervalId = window.setInterval(() => {
      void refreshOrders()
    }, 10000)

    return () => {
      window.clearInterval(intervalId)
      void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span
          className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <FolderSearch className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">No orders yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Orders appear once a creator accepts one of your requests.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Link href="/requests" className={buttonVariants()}>
            View requests
          </Link>
          <Link href="/creators" className={cn(buttonVariants({ variant: "outline" }))}>
            Find creators
          </Link>
        </div>
      </div>
    )
  }

  return <OrdersClientTable orders={orders} />
}
