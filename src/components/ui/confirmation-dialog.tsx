"use client"

import * as React from "react"
import { AlertCircle, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary/10 bg-linear-to-b from-background to-primary/5 shadow-xl sm:rounded-2xl" showCloseButton={false}>
        <DialogHeader className="flex flex-col items-center gap-4 pt-4 text-center sm:pr-0">
          <div className={cn(
            "flex size-12 items-center justify-center rounded-full shadow-xs",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "destructive" && "bg-rose-500/10 text-rose-600",
            variant === "warning" && "bg-amber-500/10 text-amber-600"
          )}>
            {variant === "destructive" ? (
              <AlertCircle className="size-6" />
            ) : (
              <HelpCircle className="size-6" />
            )}
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-8 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-center">
          <DialogClose asChild>
            <Button variant="ghost" className="h-10 px-6 font-medium" disabled={isLoading}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className={cn(
              "h-10 px-6 font-semibold shadow-md",
              variant === "default" && "bg-primary hover:bg-primary/90",
              variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white"
            )}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
