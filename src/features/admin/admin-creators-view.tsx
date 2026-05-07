"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, Eye, Search, ShieldBan, Store, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import type { Creator } from "@/features/site/marketplace/types"
import { toast } from "sonner"

type AvailabilityFilter = "all" | "available" | "unavailable"
type PendingCreatorAction = {
  type: "delete" | "activate" | "deactivate"
  creator: Creator
} | null

function downloadCsv(data: any[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0]).join(",")
  const rows = data.map((item) =>
    Object.values(item)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = [headers, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function AdminCreatorsView({ creators }: { creators: Creator[] }) {
  const [search, setSearch] = useState("")
  const [availability, setAvailability] = useState<AvailabilityFilter>("all")
  const [rows, setRows] = useState(creators)
  const [deletingCreatorId, setDeletingCreatorId] = useState("")
  const [deactivatingCreatorId, setDeactivatingCreatorId] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingCreatorAction>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((creator) => {
      const matchesSearch =
        query.length === 0 ||
        creator.name.toLowerCase().includes(query) ||
        creator.handle.toLowerCase().includes(query) ||
        creator.id.toLowerCase().includes(query) ||
        (creator.email ?? "").toLowerCase().includes(query)

      const matchesAvailability =
        availability === "all" ||
        (availability === "available" ? creator.isAvailable : !creator.isAvailable)

      return matchesSearch && matchesAvailability
    })
  }, [availability, rows, search])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, availability])

  async function handleDeleteCreator(creatorId: string) {
    setDeletingCreatorId(creatorId)
    try {
      const response = await fetch(`/api/admin/creators/${encodeURIComponent(creatorId)}`, {
        method: "DELETE",
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to delete creator.")
      }
      setRows((current) => current.filter((item) => item.id !== creatorId))
      toast.success("Creator deleted.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete creator.")
    } finally {
      setDeletingCreatorId("")
    }
  }

  async function handleStatusCreator(creator: Creator) {
    const nextAction = creator.isAvailable ? "deactivate" : "activate"
    setDeactivatingCreatorId(creator.id)
    try {
      const response = await fetch(`/api/admin/creators/${encodeURIComponent(creator.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || `Unable to ${nextAction} creator.`)
      }
      setRows((current) =>
        current.map((item) => (item.id === creator.id ? { ...item, isAvailable: nextAction === "activate" } : item))
      )
      toast.success(nextAction === "deactivate" ? "Creator deactivated." : "Creator activated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${nextAction} creator.`)
    } finally {
      setDeactivatingCreatorId("")
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return
    if (pendingAction.type === "delete") {
      await handleDeleteCreator(pendingAction.creator.id)
    } else {
      await handleStatusCreator(pendingAction.creator)
    }
    setPendingAction(null)
  }

  function handleExport() {
    const exportData = filtered.map((c) => ({
      ID: c.id,
      Name: c.name,
      Handle: c.handle,
      Email: c.email || "",
      StartingPrice: c.startingPrice,
      Rating: c.rating,
      CompletedOrders: c.completedOrders,
      Available: c.isAvailable ? "Yes" : "No",
    }))
    downloadCsv(exportData, `creators_export_${new Date().toISOString().split("T")[0]}.csv`)
    toast.success("CSV export started.")
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        icon={Store}
        badge="Supply"
        title="Creators"
        description="Marketplace supply — same catalog as the public site. Open a row for full profile + linked user."
        actions={
          <Button 
            variant="outline" 
            className="h-9 border-primary/25 bg-background/80 hover:bg-primary/10"
            onClick={handleExport}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <section className="rounded-2xl border border-primary/20 bg-card/80 p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, handle, or ID"
              className="border-primary/20 bg-background/80 pl-8"
            />
          </div>
          <Select
            value={availability}
            onValueChange={(v) => setAvailability(v as AvailabilityFilter)}
          >
            <SelectTrigger className="border-primary/20 bg-background/80">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Accepting orders</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b border-primary/15 pb-4">
          <CardTitle>Creator directory</CardTitle>
          <CardDescription>
            Tabular layout — pricing and volume are right-aligned with tabular numerals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="min-w-[100px] font-mono text-xs text-muted-foreground">
                    Creator ID
                  </TableHead>
                  <TableHead className="min-w-[200px]">Creator</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead className="text-right tabular-nums">From</TableHead>
                  <TableHead className="text-right tabular-nums">Rating</TableHead>
               
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right tabular-nums">Completed</TableHead>
                  <TableHead className="w-[280px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                      {c.id}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-3">
                        <CreatorAvatar creator={c} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-sm">@{c.handle}</TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {formatUsd(c.startingPrice)}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {c.rating.toFixed(1)}
                    </TableCell>
               
                    <TableCell className="align-middle">
                      {c.visibility === "private" ? (
                        <Badge variant="outline">Private</Badge>
                      ) : c.visibility === "unlisted" ? (
                        <Badge variant="outline">Unlisted</Badge>
                      ) : c.isAvailable ? (
                        <Badge className="bg-emerald-100 text-emerald-700" variant="outline">Active</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700" variant="outline">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {c.completedOrders}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          render={<Link href={`/dashboard/admin/creators/${c.id}`} />}
                          aria-label={`Preview ${c.name}`}
                          title="Preview"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          disabled={deletingCreatorId === c.id}
                          onClick={() => setPendingAction({ type: "delete", creator: c })}
                          aria-label={`Delete ${c.name}`}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          disabled={deactivatingCreatorId === c.id}
                          onClick={() =>
                            setPendingAction({
                              type: c.isAvailable ? "deactivate" : "activate",
                              creator: c,
                            })
                          }
                          aria-label={`${c.isAvailable ? "Deactivate" : "Activate"} ${c.name}`}
                          title={c.isAvailable ? "Deactivate" : "Activate"}
                        >
                          <ShieldBan className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          <ul className="divide-y divide-border md:hidden">
            {paginated.map((c) => (
              <li key={c.id} className="flex gap-3 px-4 py-4">
                <CreatorAvatar creator={c} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email || "—"}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{c.id}</p>
                      <p className="text-xs text-muted-foreground">@{c.handle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 shrink-0 p-0"
                        render={<Link href={`/dashboard/admin/creators/${c.id}`} />}
                        aria-label={`Preview ${c.name}`}
                        title="Preview"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 shrink-0 p-0"
                        disabled={deletingCreatorId === c.id}
                        onClick={() => setPendingAction({ type: "delete", creator: c })}
                        aria-label={`Delete ${c.name}`}
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 shrink-0 p-0"
                        disabled={deactivatingCreatorId === c.id}
                        onClick={() =>
                          setPendingAction({
                            type: c.isAvailable ? "deactivate" : "activate",
                            creator: c,
                          })
                        }
                        aria-label={`${c.isAvailable ? "Deactivate" : "Activate"} ${c.name}`}
                        title={c.isAvailable ? "Deactivate" : "Activate"}
                      >
                        <ShieldBan className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.isVerified ? <Badge variant="secondary">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
                    {c.visibility === "private" ? (
                      <Badge variant="outline">Private</Badge>
                    ) : c.visibility === "unlisted" ? (
                      <Badge variant="outline">Unlisted</Badge>
                    ) : c.isAvailable ? (
                      <Badge variant="default">Open</Badge>
                    ) : (
                      <Badge variant="outline">Busy</Badge>
                    )}
                  </div>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatUsd(c.startingPrice)} · {c.rating.toFixed(1)} ★ · {c.completedOrders} done
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-primary/10 px-4 py-4 sm:px-6">
              <div className="flex flex-1 items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  of <span className="font-medium">{filtered.length}</span> results
                </p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => (!open ? setPendingAction(null) : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === "delete"
                ? "Delete creator?"
                : pendingAction?.type === "deactivate"
                  ? "Close creator account?"
                  : "Open creator account?"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.type === "delete"
                ? "This permanently deletes the creator profile and cannot be undone."
                : pendingAction?.type === "deactivate"
                  ? "This will close the creator account and set visibility to unavailable."
                  : "This will open the creator account and allow availability again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction?.type === "delete" ? "destructive" : "default"}
              onClick={() => void confirmPendingAction()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreatorAvatar({ creator }: { creator: Creator }) {
  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
      <Image
        src={creator.avatar}
        alt=""
        width={40}
        height={40}
        className="size-full object-cover"
      />
    </span>
  )
}
