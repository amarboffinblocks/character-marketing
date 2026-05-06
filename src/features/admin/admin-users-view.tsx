"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Download, Eye, Search, ShieldBan, Trash2, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import type { AdminDirectoryUser } from "@/features/admin/admin-directory-data"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import { toast } from "sonner"

const roleVariant: Record<AdminDirectoryUser["role"], "default" | "secondary" | "outline"> = {
  buyer: "secondary",
  creator: "default",
  admin: "outline",
}

type RoleFilter = "all" | AdminDirectoryUser["role"]
type StatusFilter = "all" | AdminDirectoryUser["status"]
type PendingUserAction = {
  type: "delete" | "activate" | "deactivate"
  user: AdminDirectoryUser
} | null

function getUserAvatarUrl(user: AdminDirectoryUser) {
  return user.avatarUrl
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.slice(0, 1))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}

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

export function AdminUsersView({ users }: { users: AdminDirectoryUser[] }) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [rows, setRows] = useState(users)
  const [deletingUserId, setDeletingUserId] = useState("")
  const [deactivatingUserId, setDeactivatingUserId] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingUserAction>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((u) => {
      const matchesSearch =
        q.length === 0 ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter
      const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [rows, search, roleFilter, statusFilter])

  async function handleDeleteUser(userId: string) {
    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to delete user.")
      }
      setRows((current) => current.filter((item) => item.id !== userId))
      toast.success("User deleted.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user.")
    } finally {
      setDeletingUserId("")
    }
  }

  async function handleStatusUser(user: AdminDirectoryUser) {
    const nextAction = user.status === "active" ? "deactivate" : "activate"
    setDeactivatingUserId(user.id)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || `Unable to ${nextAction} user.`)
      }
      setRows((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                status: nextAction === "deactivate" ? "suspended" : "active",
                flags:
                  nextAction === "deactivate"
                    ? Array.from(new Set([...item.flags, "suspended"]))
                    : item.flags.filter((flag) => flag !== "suspended"),
              }
            : item
        )
      )
      toast.success(nextAction === "deactivate" ? "User deactivated." : "User activated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${nextAction} user.`)
    } finally {
      setDeactivatingUserId("")
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return
    if (pendingAction.type === "delete") {
      await handleDeleteUser(pendingAction.user.id)
    } else {
      await handleStatusUser(pendingAction.user)
    }
    setPendingAction(null)
  }

  function handleExport() {
    const exportData = filtered.map((u) => ({
      ID: u.id,
      Name: u.displayName,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      Orders: u.ordersCount,
      Spend: u.lifetimeSpendUsd,
    }))
    downloadCsv(exportData, `users_export_${new Date().toISOString().split("T")[0]}.csv`)
    toast.success("CSV export started.")
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        icon={Users}
        badge="User management"
        title="Users"
        description="Search, filter, preview, and manage platform users."
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
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID"
              className="border-primary/20 bg-background/80 pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="border-primary/20 bg-background/80">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="border-primary/20 bg-background/80">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Deactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b border-primary/15 pb-4">
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            Tabular layout — IDs and numbers use monospace / tabular numerals for scanning.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="min-w-[100px] font-mono text-xs text-muted-foreground">
                    User ID
                  </TableHead>
                  <TableHead className="min-w-[220px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right tabular-nums">Orders</TableHead>
                  <TableHead className="text-right tabular-nums">Spend</TableHead>
                  <TableHead className="w-[280px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                      {u.id}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-11 border border-border/70">
                          <AvatarImage src={getUserAvatarUrl(u)} alt={u.displayName} />
                          <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{u.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="align-middle">
                      <Badge variant={roleVariant[u.role]} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge variant={u.status === "active" ? "default" : "destructive"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {u.ordersCount}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {u.lifetimeSpendUsd > 0 ? formatUsd(u.lifetimeSpendUsd) : "—"}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          render={<Link href={`/dashboard/admin/users/${u.id}`} />}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          disabled={deletingUserId === u.id}
                          onClick={() => setPendingAction({ type: "delete", user: u })}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8"
                          disabled={deactivatingUserId === u.id}
                          onClick={() =>
                            setPendingAction({
                              type: u.status === "active" ? "deactivate" : "activate",
                              user: u,
                            })
                          }
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
            {filtered.map((u) => (
              <li key={u.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-10 border border-border/70">
                      <AvatarImage src={getUserAvatarUrl(u)} alt={u.displayName} />
                      <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{u.displayName}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{u.id}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={roleVariant[u.role]} className="capitalize">
                    {u.role}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant={u.status === "active" ? "default" : "destructive"}>
                    {u.status}
                  </Badge>
                  <span className="tabular-nums">{u.ordersCount} orders</span>
                  <span>·</span>
                  <span className="tabular-nums">
                    {u.lifetimeSpendUsd > 0 ? formatUsd(u.lifetimeSpendUsd) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      render={<Link href={`/dashboard/admin/users/${u.id}`} />}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      disabled={deletingUserId === u.id}
                      onClick={() => setPendingAction({ type: "delete", user: u })}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8"
                      disabled={deactivatingUserId === u.id}
                      onClick={() =>
                        setPendingAction({
                          type: u.status === "active" ? "deactivate" : "activate",
                          user: u,
                        })
                      }
                    >
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => (!open ? setPendingAction(null) : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === "delete"
                ? "Delete user?"
                : pendingAction?.type === "deactivate"
                  ? "Deactivate user?"
                  : "Activate user?"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.type === "delete"
                ? "This permanently deletes the user profile and cannot be undone."
                : pendingAction?.type === "deactivate"
                  ? "This will suspend the user account."
                  : "This will reopen the user account."}
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
