"use client"

import { useState, useEffect } from "react"

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/messages/unread-total")
        const data = await res.json()
        setUnreadCount(data.count || 0)
      } catch (err) {
        console.error("Failed to fetch unread message count", err)
      }
    }

    fetchCount()
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return { unreadCount }
}
