"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarCard } from "@/features/creator/workspace/avatars/avatar-card"
import {
  CreatorAvatar,
  AvatarSafety,
  AvatarVisibility,
} from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

export function AvatarsWorkspaceView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | AvatarVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | AvatarSafety>("all")
  const [avatars, setAvatars] = useState<CreatorAvatar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteAvatar, setPendingDeleteAvatar] = useState<CreatorAvatar | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAvatars() {
      try {
        const response = await fetch("/api/creator/avatars")
        if (!response.ok) return
        const payload = (await response.json()) as { items?: CreatorAvatar[] }
        if (!mounted) return
        setAvatars(payload.items ?? [])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadAvatars()
    return () => {
      mounted = false
    }
  }, [])

  const filteredAvatars = useMemo(() => {
    const query = search.trim().toLowerCase()
    return avatars.filter((avatar) => {
      const matchesSearch =
        query.length === 0 ||
        avatar.avatarName.toLowerCase().includes(query) ||
        avatar.notes.toLowerCase().includes(query) ||
        avatar.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesVisibility = visibilityFilter === "all" || avatar.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" || avatar.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [avatars, safetyFilter, search, visibilityFilter])

  function handleEdit(avatarId: string) {
    router.push(`/dashboard/creator/workspace/avatars/edit?edit=${avatarId}`)
  }

  async function handleShare(avatarId: string) {
    const shareUrl = `${window.location.origin}/share/avatars/${avatarId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Avatar link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  function handleDelete(avatarId: string) {
    const target = avatars.find((avatar) => avatar.id === avatarId) ?? null
    setPendingDeleteAvatar(target)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteAvatar() {
    if (!pendingDeleteAvatar) return
    const avatarId = pendingDeleteAvatar.id
    const response = await fetch(`/api/creator/avatars?id=${avatarId}`, { method: "DELETE" })
    const payload = (await response.json()) as { error?: string; details?: string }
    if (!response.ok) {
      toast.error("Unable to delete avatar", {
        description: payload.details ?? payload.error ?? "Please try again.",
      })
      return
    }
    setAvatars((current) => current.filter((avatar) => avatar.id !== avatarId))
    toast.success("Avatar deleted")
    setDeleteDialogOpen(false)
    setPendingDeleteAvatar(null)
  }

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

          {/* <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-medium text-foreground">{filteredAvatars.length}</span> avatars
            </span>
            <Badge variant="outline">{avatars.length} total</Badge>
          </div> */}

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Loading avatars...</p>
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No avatars found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new avatar.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredAvatars.map((avatar) => (
                <AvatarCard
                  key={avatar.id}
                  avatar={avatar}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete avatar?</DialogTitle>
            <DialogDescription>
              {pendingDeleteAvatar
                ? `This will permanently remove "${pendingDeleteAvatar.avatarName}".`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPendingDeleteAvatar(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteAvatar}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
