"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            "group relative rounded-2xl border border-white/[0.08] bg-black/40 text-white shadow-[0_20px_50px_-12px_rgba(85,46,251,0.4)] ring-1 ring-white/10 backdrop-blur-2xl px-5 py-4",
          title: "text-[15px] font-bold tracking-tight text-white/95 leading-tight",
          description: "text-[13.5px] leading-relaxed text-white/60 mt-1",
          actionButton:
            "rounded-xl border border-primary/50 bg-primary/20 px-4 py-2 text-[13px] font-medium text-primary hover:bg-primary/30 transition-all duration-200",
          cancelButton:
            "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200",
          closeButton:
            "border-white/10 bg-black/20 text-white/40 hover:text-white hover:bg-black/40 transition-all duration-200",
          content: "gap-1",
          icon: "text-primary scale-110",
          success: "border-emerald-500/30 bg-emerald-500/10",
          error: "border-red-500/30 bg-red-500/10",
          warning: "border-amber-500/30 bg-amber-500/10",
          info: "border-primary/30 bg-primary/10",
        },
      }}
    />
  )
}
