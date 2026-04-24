"use client"

import { cn } from "@/lib/utils"

type PageLoaderProps = {
  open: boolean
  label?: string
  className?: string
}

export function PageLoader({ open, label = "Loading...", className }: PageLoaderProps) {
  if (!open) return null

  return (
    <div className={cn("fixed inset-0 z-120 flex items-center justify-center bg-background/65 backdrop-blur-md", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="loader-smoke loader-smoke-a" />
        <div className="loader-smoke loader-smoke-b" />
        <div className="loader-smoke loader-smoke-c" />
      </div>

      <div className="relative z-10 flex min-w-44 flex-col items-center gap-3 rounded-xl border border-border/70 bg-card/95 px-6 py-5 shadow-xl">
        <span className="loader-ring" aria-hidden />
        <p className="text-sm font-medium text-card-foreground">{label}</p>
      </div>
    </div>
  )
}
