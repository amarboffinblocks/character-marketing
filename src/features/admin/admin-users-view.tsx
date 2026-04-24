"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Download, Eye, Search, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { AdminUserRecord } from "@/features/admin/admin-users-data"
import { adminUserRecords } from "@/features/admin/admin-users-data"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"

const roleVariant: Record<AdminUserRecord["role"], "default" | "secondary" | "outline"> = {
  buyer: "secondary",
  creator: "default",
  admin: "outline",
}

type RoleFilter = "all" | AdminUserRecord["role"]
type StatusFilter = "all" | AdminUserRecord["status"]

function getUserAvatarUrl(user: AdminUserRecord) {
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(user.email)}`
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

export function AdminUsersView() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return adminUserRecords.filter((u) => {
      const matchesSearch =
        q.length === 0 ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter
      const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [search, roleFilter, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        icon={Users}
        badge="User management"
        title="Users"
        description="Search, filter, and open full platform profiles. Demo directory only."
        actions={
          <Button variant="outline" className="h-9 border-primary/25 bg-background/80 hover:bg-primary/10">
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
              <SelectItem value="creator">Creator</SelectItem>
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
              <SelectItem value="suspended">Suspended</SelectItem>
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
          <div className="overflow-x-auto">
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
                  <TableHead className="min-w-[140px]">Last active</TableHead>
                  <TableHead className="text-right tabular-nums">Orders</TableHead>
                  <TableHead className="text-right tabular-nums">Spend</TableHead>
                  <TableHead className="min-w-[110px]">Joined</TableHead>
                  <TableHead className="w-[100px] text-right">Action</TableHead>
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
                    <TableCell className="align-middle text-xs text-muted-foreground whitespace-nowrap">
                      {u.lastActiveAt}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {u.ordersCount}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {u.lifetimeSpendUsd > 0 ? formatUsd(u.lifetimeSpendUsd) : "—"}
                    </TableCell>
                    <TableCell className="align-middle text-xs text-muted-foreground whitespace-nowrap">
                      {u.joinedAt}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        render={<Link href={`/dashboard/admin/users/${u.id}`} />}
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
                  <span className="text-[11px] text-muted-foreground">{u.lastActiveAt}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    render={<Link href={`/dashboard/admin/users/${u.id}`} />}
                  >
                    View
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
