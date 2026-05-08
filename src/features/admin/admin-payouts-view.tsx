"use client"

import { useState } from "react"
import { Banknote, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"

export type PendingPayoutRow = {
  id: string
  creatorId: string
  creatorName: string
  amountCents: number
  date: string
  stripeAccountId: string
}

export function AdminPayoutsView({
  pendingRequests,
}: {
  pendingRequests: PendingPayoutRow[]
}) {
  const [requests, setRequests] = useState(pendingRequests)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payout-requests/${id}/approve`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to approve payout")
      toast.success("Payout approved and transferred successfully.")
      setRequests((curr) => curr.filter((req) => req.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Reason for rejection:")
    if (reason === null) return // cancelled

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payout-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reject payout")
      toast.success("Payout request rejected.")
      setRequests((curr) => curr.filter((req) => req.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        tone="studio"
        icon={Banknote}
        badge="Finance"
        title="Payout requests"
        description="Review and approve creator withdrawal requests. Approving triggers a Stripe Connect Transfer to their connected account."
      />

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2">
            Pending requests
            <Badge variant="secondary" className="ml-2">
              {requests.length}
            </Badge>
          </CardTitle>
          <CardDescription>Requests are processed in the order they were received.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">All caught up</h3>
              <p className="mt-1 text-sm text-muted-foreground">No pending payout requests to review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Creator</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stripe Account</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const isProcessing = processingId === req.id
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.creatorName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(req.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatUsd(req.amountCents / 100)}
                      </TableCell>
                      <TableCell>
                        {req.stripeAccountId ? (
                          <span className="font-mono text-xs text-muted-foreground">
                            {req.stripeAccountId}
                          </span>
                        ) : (
                          <Badge variant="destructive">Not connected</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleReject(req.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={isProcessing || !req.stripeAccountId}
                            onClick={() => handleApprove(req.id)}
                            className="gap-2"
                          >
                            {isProcessing ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Banknote className="size-3.5" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
