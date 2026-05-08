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
            "group relative rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-[0_18px_50px_-22px_rgba(85,46,251,0.35)] ring-1 ring-primary/10 backdrop-blur-xl",
          title: "text-sm font-semibold tracking-tight text-foreground",
          description: "text-[13px] leading-5 text-muted-foreground",
          actionButton:
            "rounded-lg border border-primary/80 bg-primary px-3 text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "rounded-lg border border-border bg-background/80 px-3 text-muted-foreground hover:bg-muted hover:text-foreground",
          closeButton:
            "border-transparent bg-transparent text-muted-foreground/60 hover:text-foreground",
          content: "gap-1.5 pl-3",
          icon: "text-primary",
          success: "",
          error: "",
          warning: "",
          info: "",
        },
      }}
    />
  )
}
