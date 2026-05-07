"use client"

import { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"

export function PreviewSecurityShield({ watermark }: { watermark: string }) {
  const [isFocused, setIsFocused] = useState(true)

  useEffect(() => {
    function blockContextMenu(event: MouseEvent) {
      event.preventDefault()
    }

    function blockDragStart(event: DragEvent) {
      event.preventDefault()
    }

    function blockCopy(event: ClipboardEvent) {
      event.preventDefault()
    }

    function blockKeydown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      const isScreenshotCombo =
        key === "printscreen" ||
        ((event.metaKey || event.ctrlKey) && event.shiftKey && (key === "3" || key === "4" || key === "5"))

      if (isScreenshotCombo) {
        event.preventDefault()
      }
    }

    function handleBlur() {
      setIsFocused(false)
    }

    function handleFocus() {
      setIsFocused(true)
    }

    // Double check initial state
    setIsFocused(document.hasFocus())

    window.addEventListener("contextmenu", blockContextMenu)
    window.addEventListener("dragstart", blockDragStart)
    window.addEventListener("copy", blockCopy)
    window.addEventListener("cut", blockCopy)
    window.addEventListener("keydown", blockKeydown)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("contextmenu", blockContextMenu)
      window.removeEventListener("dragstart", blockDragStart)
      window.removeEventListener("copy", blockCopy)
      window.removeEventListener("cut", blockCopy)
      window.removeEventListener("keydown", blockKeydown)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
        .no-select {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>
      {/* Watermark overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.14]"
      >
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:20px_20px] text-foreground/40" />
        <div className="absolute inset-0 flex flex-wrap content-start items-start gap-12 p-4 text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/60">
          {Array.from({ length: 64 }).map((_, index) => (
            <span key={`${watermark}-${index}`} className="rotate-[-32deg] whitespace-nowrap">
              STRICTLY CONFIDENTIAL · PROTECTED PREVIEW · {watermark} · INTERNAL USE ONLY
            </span>
          ))}
        </div>
      </div>

      {/* Focus lock overlay */}
      {!isFocused && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl">
          <ShieldAlert className="mb-4 size-16 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Content Hidden</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please click on this window to resume viewing the protected preview.
          </p>
        </div>
      )}
    </>
  )
}
