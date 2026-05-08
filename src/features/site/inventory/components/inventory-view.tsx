"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  Image as ImageIcon,
  LayoutGrid,
  Package,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react"

import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import type { InventoryCategory, InventoryListEntry } from "@/features/site/inventory/inventory-data"
import { InventoryAssetCard } from "@/features/site/inventory/components/inventory-asset-card"

type InventoryTab = "all" | InventoryCategory

const inventoryTabs: SectionTabItem<InventoryTab>[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "character", label: "Characters", icon: UserRound },
  { value: "persona", label: "Personas", icon: Users },
  { value: "lorebook", label: "Lorebooks", icon: BookOpen },
  { value: "avatar", label: "Avatars", icon: Sparkles },
  { value: "background", label: "Backgrounds", icon: ImageIcon },
]

export function InventoryView() {
  const [tab, setTab] = useState<InventoryTab>("all")
  const [items, setItems] = useState<InventoryListEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch("/api/site/inventory")
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const json = await response.json()
        if (Array.isArray(json.inventory)) {
          setItems(json.inventory)
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInventory()
  }, [])

  const filteredItems = useMemo(() => {
    if (tab === "all") return items
    return items.filter((item) => item.category === tab)
  }, [items, tab])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary">
              <Package className="size-3.5" aria-hidden />
              Your library
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Inventory
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Characters, personas, lorebooks, avatars, and backgrounds you have purchased from the
              marketplace same card shapes as creator workspace, ready to open or reference in
              orders.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <SectionTabs value={tab} onChange={setTab} items={inventoryTabs} />

        {isLoading ? (
          <div className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Nothing in this tab yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Purchased assets will appear here after orders are delivered.
            </p>
          </div>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <InventoryAssetCard key={`${item.category}-${item.id}`} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
