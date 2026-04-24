"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      richColors
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border-border bg-card text-card-foreground shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "bg-muted text-muted-foreground hover:bg-muted/80",
          closeButton:
            "border-border bg-background text-muted-foreground hover:text-foreground",
        },
      }}
    />
  )
}
