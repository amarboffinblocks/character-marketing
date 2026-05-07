"use client"

import { useMemo, useState } from "react"

import { useInboxContext } from "@/components/notifications/inbox-provider"
import type { InboxRole, InboxTab } from "@/features/inbox/types"

export function useInboxFeed(_: InboxRole, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const inbox = useInboxContext()
  const [activeTab, setActiveTab] = useState<InboxTab>("all")

  const filteredItems = useMemo(() => {
    if (!enabled) return []
    if (activeTab === "all") return inbox.items
    return inbox.items.filter((item) => item.type === "system")
  }, [activeTab, enabled, inbox.items])

  if (!enabled) {
    return {
      items: [],
      filteredItems: [],
      unreadCount: 0,
      unreadPreview: [],
      activeTab,
      setActiveTab,
      isLoading: false,
      error: "",
      markItemRead: async () => {},
      markAllRead: async () => {},
      refresh: async () => {},
    }
  }

  return {
    ...inbox,
    filteredItems,
    activeTab,
    setActiveTab,
  }
}
