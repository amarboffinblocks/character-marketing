"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { RealtimeChannel, Session, AuthChangeEvent } from "@supabase/supabase-js"
import { toast } from "sonner"

import type { InboxItem } from "@/features/inbox/types"
import { createClientSupabaseClient } from "@/lib/supabase/client"

type InboxNotificationRow = {
  id: string
  user_id: string
  type: InboxItem["type"]
  category: InboxItem["category"]
  title: string
  body: string
  is_read: boolean
  action_url: string | null
  created_at: string
}

type InboxContextValue = {
  items: InboxItem[]
  isLoading: boolean
  error: string
  unreadCount: number
  unreadPreview: InboxItem[]
  refresh: () => Promise<void>
  markItemRead: (itemId: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const InboxContext = createContext<InboxContextValue | null>(null)

function sortByCreatedAtDesc(items: InboxItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function mapNotificationRow(row: InboxNotificationRow): InboxItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    category: row.category,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    actionUrl: row.action_url,
    createdAt: row.created_at,
  }
}

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const seenToastIdsRef = useRef<Set<string>>(new Set())
  const hasLoadedOnceRef = useRef(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [items, setItems] = useState<InboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const refreshInbox = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false

    if (!userId) {
      setItems([])
      setError("")
      setIsLoading(false)
      return
    }

    if (!silent) {
      setIsLoading(true)
    }
    setError("")
    try {
      const response = await fetch("/api/inbox", { cache: "no-store" })
      const json = (await response.json().catch(() => ({}))) as { items?: InboxItem[]; error?: string }

      if (!response.ok) {
        throw new Error(json.error || "Failed to fetch inbox.")
      }

      const nextItems = sortByCreatedAtDesc(
        Array.isArray(json.items)
          ? json.items.map((item) => ({
              ...item,
              userId: item.userId || userId,
            }))
          : []
      )

      if (hasLoadedOnceRef.current) {
        for (const item of nextItems) {
          if (!seenToastIdsRef.current.has(item.id)) {
            seenToastIdsRef.current.add(item.id)
            toast(item.title, {
              description: item.body,
              action:
                item.actionUrl
                  ? {
                      label: "Open",
                      onClick: () => {
                        window.location.href = item.actionUrl as string
                      },
                    }
                  : undefined,
            })
          }
        }
      } else {
        seenToastIdsRef.current = new Set(nextItems.map((item) => item.id))
        hasLoadedOnceRef.current = true
      }

      setItems(nextItems)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inbox.")
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [userId])

  const refresh = useCallback(async () => {
    await refreshInbox()
  }, [refreshInbox])

  useEffect(() => {
    let isMounted = true

    async function bootstrapUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return
      setUserId(user?.id ?? null)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (isMounted) {
          setUserRole(profile?.role ?? null)
        }
      } else {
        setUserRole(null)
      }
    }

    void bootstrapUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
      const nextUserId = session?.user?.id ?? null
      seenToastIdsRef.current = new Set()
      hasLoadedOnceRef.current = false
      setUserId(nextUserId)
      setUserRole(session?.user?.user_metadata?.role ?? null) // Quick fallback
      if (!nextUserId) {
        setItems([])
        setError("")
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    void refreshInbox()
  }, [refreshInbox])

  useEffect(() => {
    if (!userId) {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`inbox-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const nextItem = mapNotificationRow(payload.new as InboxNotificationRow)
          setItems((current) => {
            if (current.some((item) => item.id === nextItem.id)) {
              return current
            }
            return sortByCreatedAtDesc([nextItem, ...current])
          })

          if (!seenToastIdsRef.current.has(nextItem.id)) {
            seenToastIdsRef.current.add(nextItem.id)
            toast(nextItem.title, {
              description: nextItem.body,
              action:
                nextItem.actionUrl
                  ? {
                      label: "Open",
                      onClick: () => {
                        window.location.href = nextItem.actionUrl as string
                      },
                    }
                  : undefined,
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "inbox_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const nextItem = mapNotificationRow(payload.new as InboxNotificationRow)
          setItems((current) =>
            current.map((item) => (item.id === nextItem.id ? { ...item, isRead: nextItem.isRead } : item))
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase, userId])

  useEffect(() => {
    if (!userId) return

    const intervalId = window.setInterval(() => {
      void refreshInbox({ silent: true })
    }, 10000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshInbox({ silent: true })
      }
    }

    window.addEventListener("focus", handleVisibilityChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleVisibilityChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [refreshInbox, userId])

  const markItemRead = useCallback(async (itemId: string) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, isRead: true } : item)))

    try {
      await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: itemId }),
      })
    } catch {
      await refresh()
    }
  }, [refresh])

  const markAllRead = useCallback(async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })))

    try {
      await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
    } catch {
      await refresh()
    }
  }, [refresh])

  const value = useMemo<InboxContextValue>(() => {
    const unreadItems = items.filter((item) => !item.isRead)
    return {
      items,
      isLoading,
      error,
      unreadCount: unreadItems.length,
      unreadPreview: unreadItems.slice(0, 6),
      refresh,
      markItemRead,
      markAllRead,
    }
  }, [error, isLoading, items, markAllRead, markItemRead, refresh])

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
}

export function useInboxContext() {
  const value = useContext(InboxContext)

  if (!value) {
    throw new Error("useInboxContext must be used within an InboxProvider.")
  }

  return value
}
