"use client"

import { useMemo, useState } from "react"
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
import type { InventoryCategory } from "@/features/site/inventory/inventory-data"
import { getInventoryListFiltered } from "@/features/site/inventory/inventory-data"
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

  const items = useMemo(() => getInventoryListFiltered(tab), [tab])

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
              marketplace—same card shapes as creator workspace, ready to open or reference in
              orders.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <SectionTabs value={tab} onChange={setTab} items={inventoryTabs} />

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Nothing in this tab yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Purchases will appear here after you order from creators.
            </p>
          </div>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <InventoryAssetCard key={`${item.category}-${item.id}`} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
