"use client"

import { useEffect } from "react"

export function PreviewSecurityShield({ watermark }: { watermark: string }) {
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

    window.addEventListener("contextmenu", blockContextMenu)
    window.addEventListener("dragstart", blockDragStart)
    window.addEventListener("copy", blockCopy)
    window.addEventListener("cut", blockCopy)
    window.addEventListener("keydown", blockKeydown)

    return () => {
      window.removeEventListener("contextmenu", blockContextMenu)
      window.removeEventListener("dragstart", blockDragStart)
      window.removeEventListener("copy", blockCopy)
      window.removeEventListener("cut", blockCopy)
      window.removeEventListener("keydown", blockKeydown)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.06]"
    >
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:28px_28px] text-foreground/30" />
      <div className="absolute inset-0 flex flex-wrap content-start items-start gap-16 p-8 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/50">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={`${watermark}-${index}`} className="rotate-[-24deg]">
            Protected Preview · {watermark}
          </span>
        ))}
      </div>
    </div>
  )
}
