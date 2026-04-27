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
import { BackgroundCard } from "@/features/creator/workspace/backgrounds/background-card"
import {
  CreatorBackground,
  BackgroundSafety,
  BackgroundVisibility,
} from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { cn } from "@/lib/utils"

export function BackgroundsWorkspaceView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | BackgroundVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | BackgroundSafety>("all")
  const [backgrounds, setBackgrounds] = useState<CreatorBackground[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteBackground, setPendingDeleteBackground] = useState<CreatorBackground | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadBackgrounds() {
      try {
        const response = await fetch("/api/creator/backgrounds")
        if (!response.ok) return
        const payload = (await response.json()) as { items?: CreatorBackground[] }
        if (!mounted) return
        setBackgrounds(payload.items ?? [])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadBackgrounds()
    return () => {
      mounted = false
    }
  }, [])

  const filteredBackgrounds = useMemo(() => {
    const query = search.trim().toLowerCase()
    return backgrounds.filter((background) => {
      const matchesSearch =
        query.length === 0 ||
        background.backgroundName.toLowerCase().includes(query) ||
        background.notes.toLowerCase().includes(query) ||
        background.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesVisibility =
        visibilityFilter === "all" || background.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" || background.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [backgrounds, safetyFilter, search, visibilityFilter])

  function handleEdit(backgroundId: string) {
    router.push(`/dashboard/creator/workspace/backgrounds/edit?edit=${backgroundId}`)
  }

  async function handleShare(backgroundId: string) {
    const shareUrl = `${window.location.origin}/share/backgrounds/${backgroundId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Background link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  function handleDelete(backgroundId: string) {
    const target = backgrounds.find((background) => background.id === backgroundId) ?? null
    setPendingDeleteBackground(target)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteBackground() {
    if (!pendingDeleteBackground) return
    const backgroundId = pendingDeleteBackground.id
    const response = await fetch(`/api/creator/backgrounds?id=${backgroundId}`, { method: "DELETE" })
    const payload = (await response.json()) as { error?: string; details?: string }
    if (!response.ok) {
      toast.error("Unable to delete background", {
        description: payload.details ?? payload.error ?? "Please try again.",
      })
      return
    }
    setBackgrounds((current) => current.filter((background) => background.id !== backgroundId))
    toast.success("Background deleted")
    setDeleteDialogOpen(false)
    setPendingDeleteBackground(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace · Backgrounds
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Curate reusable background assets for consistent world-building visuals.
            </p>
          </div>
          <Link
            href="/dashboard/creator/workspace/backgrounds/new"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus className="size-4" />
            New Background
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Background Library</CardTitle>
          <CardDescription>Search and filter reusable scene backgrounds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, type, tag or notes"
                className="pl-8"
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={(value) =>
                setVisibilityFilter(value as "all" | BackgroundVisibility)
              }
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
              onValueChange={(value) => setSafetyFilter(value as "all" | BackgroundSafety)}
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
              Showing{" "}
              <span className="font-medium text-foreground">{filteredBackgrounds.length}</span>{" "}
              backgrounds
            </span>
            <Badge variant="outline">{backgrounds.length} total</Badge>
          </div> */}

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Loading backgrounds...</p>
            </div>
          ) : filteredBackgrounds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No backgrounds found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new background.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredBackgrounds.map((background) => (
                <BackgroundCard
                  key={background.id}
                  background={background}
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
            <DialogTitle>Delete background?</DialogTitle>
            <DialogDescription>
              {pendingDeleteBackground
                ? `This will permanently remove "${pendingDeleteBackground.backgroundName}".`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPendingDeleteBackground(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteBackground}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
