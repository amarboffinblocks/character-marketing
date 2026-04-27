"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, Eye, Search, Store } from "lucide-react"

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
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import type { Creator } from "@/features/site/marketplace/types"

type AvailabilityFilter = "all" | "available" | "unavailable"

export function AdminCreatorsView({ creators }: { creators: Creator[] }) {
  const [search, setSearch] = useState("")
  const [availability, setAvailability] = useState<AvailabilityFilter>("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return creators.filter((c) => {
      const matchesSearch =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      const matchesAvail =
        availability === "all"
          ? true
          : availability === "available"
            ? c.isAvailable
            : !c.isAvailable
      return matchesSearch && matchesAvail
    })
  }, [creators, search, availability])

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        icon={Store}
        badge="Supply"
        title="Creators"
        description="Marketplace supply — same catalog as the public site. Open a row for full profile + linked user."
        actions={
          <Button variant="outline" className="h-9 border-primary/25 bg-background/80 hover:bg-primary/10">
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
          <div className="overflow-x-auto">
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
                  <TableHead className="text-right tabular-nums">Reviews</TableHead>
                  <TableHead className="min-w-[100px]">Response</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right tabular-nums">Completed</TableHead>
                  <TableHead className="w-[100px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                      {c.id}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-3">
                        <CreatorAvatar creator={c} />
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-sm">@{c.handle}</TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {formatUsd(c.startingPrice)}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {c.rating.toFixed(1)}
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {c.reviewCount}
                    </TableCell>
                    <TableCell className="align-middle text-xs text-muted-foreground whitespace-nowrap">
                      {c.responseTime}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-wrap gap-1">
                        {c.isVerified ? (
                          <Badge variant="secondary">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                        {c.isAvailable ? (
                          <Badge variant="default">Open</Badge>
                        ) : (
                          <Badge variant="outline">Busy</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-right tabular-nums text-sm">
                      {c.completedOrders}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        render={<Link href={`/dashboard/admin/creators/${c.id}`} />}
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
            {filtered.map((c) => (
              <li key={c.id} className="flex gap-3 px-4 py-4">
                <CreatorAvatar creator={c} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{c.id}</p>
                      <p className="text-xs text-muted-foreground">@{c.handle}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0"
                      render={<Link href={`/dashboard/admin/creators/${c.id}`} />}
                    >
                      View
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.isVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                    {c.isAvailable ? (
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
        </CardContent>
      </Card>
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
