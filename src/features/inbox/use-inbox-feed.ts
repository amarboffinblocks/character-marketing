"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { getMockSystemInboxItems } from "@/features/inbox/mock-inbox-data"
import { type InboxItem, type InboxRole, type InboxTab } from "@/features/inbox/types"

function sortByCreatedAtDesc(items: InboxItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function readStateStorageKey(role: InboxRole) {
  return `character-market:inbox-read:${role}`
}

function readReadIds(role: InboxRole): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(readStateStorageKey(role))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

function writeReadIds(role: InboxRole, ids: string[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(readStateStorageKey(role), JSON.stringify(Array.from(new Set(ids))))
  window.dispatchEvent(new Event("cm:inbox:read-updated"))
}

export function useInboxFeed(role: InboxRole, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [items, setItems] = useState<InboxItem[]>([])
  const [activeTab, setActiveTab] = useState<InboxTab>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const readIds = new Set(readReadIds(role))
      const systemItems = getMockSystemInboxItems(role).map((item) => ({
        ...item,
        isRead: item.isRead || readIds.has(item.id),
      }))
      // Product rule: inbox should show only activity/system updates for now.
      setItems(sortByCreatedAtDesc(systemItems))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inbox.")
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    if (!enabled) {
      setItems([])
      setIsLoading(false)
      setError("")
      return
    }
    void refresh()
  }, [enabled, refresh])

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
    (itemId: string) => {
      setItems((current) => {
        const next = current.map((item) => (item.id === itemId ? { ...item, isRead: true } : item))
        const ids = next.filter((item) => item.isRead).map((item) => item.id)
        writeReadIds(role, ids)
        return next
      })
    },
    [role]
  )

  const markAllRead = useCallback(
    () => {
      setItems((current) => {
        const next = current.map((item) => ({ ...item, isRead: true }))
        writeReadIds(
          role,
          next.map((item) => item.id)
        )
        return next
      })
    },
    [role]
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
