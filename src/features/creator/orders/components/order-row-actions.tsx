"use client"

import Link from "next/link"
import { Copy, ExternalLink, MessageSquareText, MoreHorizontal, PackageCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CreatorOrder } from "@/features/creator/orders/types"

type OrderRowActionsProps = {
  order: CreatorOrder
  context?: "creator" | "admin"
}

export function OrderRowActions({ order, context = "creator" }: OrderRowActionsProps) {
  const orderKey = encodeURIComponent(order.rawOrderId ?? order.id.toLowerCase())
  const orderHref =
    context === "admin" ? `/dashboard/admin/orders/${orderKey}` : `/dashboard/creator/orders/${order.id.toLowerCase()}`
  const messagesHref =
    context === "admin"
      ? `/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}`
      : `/dashboard/creator/messages?order=${encodeURIComponent(order.id)}`

  const customerChatHref = `/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}&target=${order.buyerId}`
  const creatorChatHref = `/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}&target=${order.creatorId}`

  function copyOrderId() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(order.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Order actions">
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem render={<Link href={orderHref} className="cursor-pointer" />}>
          <ExternalLink className="size-4" />
          Open order
        </DropdownMenuItem>
        {context === "admin" ? (
          <>
            <DropdownMenuItem render={<Link href={customerChatHref} className="cursor-pointer" />}>
              <MessageSquareText className="size-4 text-primary" />
              Chat with Customer
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={creatorChatHref} className="cursor-pointer" />}>
              <MessageSquareText className="size-4 text-emerald-500" />
              Chat with Creator
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            render={
              <Link href={messagesHref} className="cursor-pointer" />
            }
          >
            <MessageSquareText className="size-4" />
            Open messages
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyOrderId}>
          <Copy className="size-4" />
          Copy order ID
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <PackageCheck className="size-4" />
          Mark as delivered
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
