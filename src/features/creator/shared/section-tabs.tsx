"use client"

import type { ComponentType } from "react"

import { cn } from "@/lib/utils"

export type SectionTabItem<T extends string> = {
  value: T
  label: string
  icon?: ComponentType<{ className?: string }>
}

type SectionTabsProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  items: SectionTabItem<T>[]
}

export function SectionTabs<T extends string>({ value, onChange, items }: SectionTabsProps<T>) {
  return (
    <nav
      aria-label="Section tabs"
      className="flex gap-1 overflow-x-auto rounded-xl bg-muted/40 p-1"
    >
      {items.map((item) => {
        const Icon = item.icon
        const active = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
