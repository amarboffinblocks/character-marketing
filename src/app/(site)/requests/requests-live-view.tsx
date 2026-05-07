"use client"

import { useEffect, useMemo, useState } from "react"

import { createClientSupabaseClient } from "@/lib/supabase/client"
import { RequestsClientTable } from "./requests-client-table"

type RequestType = "custom_package" | "preselect_package"
type RequestStatus = "pending" | "processing" | "accepted" | "rejected" | "completed"

type BuyerRequestRow = {
  id: string
  request_type: RequestType
  creator_id: string
  requester_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: RequestStatus
  created_at: string
  request_payload: unknown
  creator_profile_data: unknown | null
  order_id: string | null
}

export function RequestsLiveView({
  initialRequests,
  userId,
}: {
  initialRequests: BuyerRequestRow[]
  userId: string
}) {
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const [requests, setRequests] = useState(initialRequests)

  useEffect(() => {
    setRequests(initialRequests)
  }, [initialRequests])

  useEffect(() => {
    async function refreshRequests() {
      const response = await fetch("/api/site/requests", { cache: "no-store" })
      const json = (await response.json().catch(() => ({}))) as { requests?: BuyerRequestRow[] }
      if (!response.ok || !Array.isArray(json.requests)) return
      setRequests(json.requests)
    }

    const channel = supabase
      .channel(`buyer-requests:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: `requester_id=eq.${userId}`,
        },
        () => {
          void refreshRequests()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `buyer_id=eq.${userId}`,
        },
        () => {
          void refreshRequests()
        }
      )
      .subscribe()

    const intervalId = window.setInterval(() => {
      void refreshRequests()
    }, 10000)

    return () => {
      window.clearInterval(intervalId)
      void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return <RequestsClientTable requests={requests} />
}
