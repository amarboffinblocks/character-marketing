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
            "border-border bg-primary text-primary-foreground shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-primary-foreground/90",
          actionButton:
            "bg-background text-foreground hover:bg-background/90",
          cancelButton:
            "bg-primary/50 text-primary-foreground hover:bg-primary/60",
          closeButton:
            "border-transparent bg-transparent text-primary-foreground/50 hover:text-primary-foreground",
        },
      }}
    />
  )
}
