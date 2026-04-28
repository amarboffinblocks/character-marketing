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
}

export function OrderRowActions({ order }: OrderRowActionsProps) {
  const orderHref = `/dashboard/creator/orders/${order.id.toLowerCase()}`

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
        <DropdownMenuItem
          render={
            <Link
              href={`/dashboard/creator/messages?order=${encodeURIComponent(order.id)}`}
              className="cursor-pointer"
            />
          }
        >
          <MessageSquareText className="size-4" />
          Message buyer
        </DropdownMenuItem>
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
