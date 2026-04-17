"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarCard } from "@/features/creator/workspace/avatars/avatar-card"
import {
  AvatarSafety,
  AvatarVisibility,
  creatorAvatars,
} from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

export function AvatarsWorkspaceView() {
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | AvatarVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | AvatarSafety>("all")

  const filteredAvatars = useMemo(() => {
    const query = search.trim().toLowerCase()
    return creatorAvatars.filter((avatar) => {
      const matchesSearch =
        query.length === 0 ||
        avatar.avatarName.toLowerCase().includes(query) ||
        avatar.notes.toLowerCase().includes(query) ||
        avatar.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesVisibility = visibilityFilter === "all" || avatar.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" || avatar.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [safetyFilter, search, visibilityFilter])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace · Avatars
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Organize creator avatar assets for characters and order delivery packs.
            </p>
          </div>
          <Link
            href="/dashboard/creator/workspace/avatars/new"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus className="size-4" />
            New Avatar
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Avatar Library</CardTitle>
          <CardDescription>Search and filter avatar assets for faster content assembly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, style, tag or notes"
                className="pl-8"
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={(value) => setVisibilityFilter(value as "all" | AvatarVisibility)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={safetyFilter}
              onValueChange={(value) => setSafetyFilter(value as "all" | AvatarSafety)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Safety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All safety</SelectItem>
                <SelectItem value="SFW">SFW</SelectItem>
                <SelectItem value="NSFW">NSFW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-medium text-foreground">{filteredAvatars.length}</span> avatars
            </span>
            <Badge variant="outline">{creatorAvatars.length} total</Badge>
          </div>

          {filteredAvatars.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No avatars found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new avatar.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredAvatars.map((avatar) => (
                <AvatarCard key={avatar.id} avatar={avatar} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
