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
            "group rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-[0_18px_50px_-22px_rgba(85,46,251,0.35)] ring-1 ring-primary/10 backdrop-blur-xl before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-linear-to-b before:from-primary before:to-accent",
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
          success:
            "before:bg-linear-to-b before:from-emerald-500 before:to-primary",
          error:
            "before:bg-linear-to-b before:from-rose-500 before:to-orange-400",
          warning:
            "before:bg-linear-to-b before:from-amber-500 before:to-orange-400",
          info:
            "before:bg-linear-to-b before:from-sky-500 before:to-primary",
        },
      }}
    />
  )
}
