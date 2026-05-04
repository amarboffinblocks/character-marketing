"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { type InboxItem, type InboxRole, type InboxTab } from "@/features/inbox/types"
import { createClientSupabaseClient } from "@/lib/supabase/client"

function sortByCreatedAtDesc(items: InboxItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function useInboxFeed(role: InboxRole, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [items, setItems] = useState<InboxItem[]>([])
  const [activeTab, setActiveTab] = useState<InboxTab>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [userId, setUserId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/inbox")
      if (!response.ok) throw new Error("Failed to fetch inbox")
      const json = (await response.json()) as { items: InboxItem[] }
      setItems(sortByCreatedAtDesc(json.items || []))
      
      // Also get current user ID for realtime filtering if not set
      if (!userId && json.items.length > 0) {
        setUserId(json.items[0].userId)
      } else if (!userId) {
        const supabase = createClientSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inbox.")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!enabled) {
      setItems([])
      setIsLoading(false)
      setError("")
      return
    }
    void refresh()

    if (!userId) return

    // Realtime subscription
    const supabase = createClientSupabaseClient()
    const channelName = `inbox-notifications-${userId}-${Math.random().toString(36).slice(2, 7)}`
    
    console.log(`[Realtime] Subscribing to: ${channelName} for user: ${userId}`)

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Record<string, any> }) => {
          console.log("[Realtime] New notification received:", payload.new)
          const newItem = payload.new
          const mappedItem: InboxItem = {
            id: newItem.id,
            userId: newItem.user_id,
            type: newItem.type,
            category: newItem.category,
            title: newItem.title,
            body: newItem.body,
            isRead: newItem.is_read,
            actionUrl: newItem.action_url,
            createdAt: newItem.created_at,
          }
          setItems((current) => sortByCreatedAtDesc([mappedItem, ...current]))
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
        (payload: { new: Record<string, any> }) => {
          console.log("[Realtime] Notification updated:", payload.new)
          const updatedItem = payload.new
          setItems((current) =>
            current.map((item) =>
              item.id === updatedItem.id ? { ...item, isRead: updatedItem.is_read } : item
            )
          )
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status: ${status}`)
      })

    return () => {
      console.log(`[Realtime] Unsubscribing from: ${channelName}`)
      void supabase.removeChannel(channel)
    }
  }, [enabled, refresh, userId])

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items
    return items.filter((item) => item.type === "system")
  }, [activeTab, items])

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items])
  const unreadPreview = useMemo(
    () => items.filter((item) => !item.isRead).slice(0, 6),
    [items]
  )

  const markItemRead = useCallback(
    async (itemId: string) => {
      // Optimistic update
      setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, isRead: true } : item))
      )

      try {
        await fetch("/api/inbox", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: itemId }),
        })
      } catch (err) {
        console.error("Failed to mark notification as read:", err)
      }
    },
    []
  )

  const markAllRead = useCallback(
    async () => {
      // Optimistic update
      setItems((current) => current.map((item) => ({ ...item, isRead: true })))

      try {
        await fetch("/api/inbox", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all: true }),
        })
      } catch (err) {
        console.error("Failed to mark all notifications as read:", err)
      }
    },
    []
  )

  useEffect(() => {
    const onReadUpdate = () => void refresh()
    window.addEventListener("cm:inbox:read-updated", onReadUpdate)
    window.addEventListener("storage", onReadUpdate)
    return () => {
      window.removeEventListener("cm:inbox:read-updated", onReadUpdate)
      window.removeEventListener("storage", onReadUpdate)
    }
  }, [refresh])

  return {
    items,
    filteredItems,
    unreadCount,
    unreadPreview,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    markItemRead,
    markAllRead,
    refresh,
  }
}
