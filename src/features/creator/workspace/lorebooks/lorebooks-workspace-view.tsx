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
import { LorebookCard } from "@/features/creator/workspace/lorebooks/lorebook-card"
import {
  CreatorLorebook,
  LorebookSafety,
  LorebookVisibility,
} from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { cn } from "@/lib/utils"

export function LorebooksWorkspaceView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | LorebookVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | LorebookSafety>("all")
  const [lorebooks, setLorebooks] = useState<CreatorLorebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteLorebook, setPendingDeleteLorebook] = useState<CreatorLorebook | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadLorebooks() {
      try {
        const response = await fetch("/api/creator/lorebooks")
        if (!response.ok) return
        const payload = (await response.json()) as { items?: CreatorLorebook[] }
        if (!mounted) return
        setLorebooks(payload.items ?? [])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadLorebooks()
    return () => {
      mounted = false
    }
  }, [])

  const filteredLorebooks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return lorebooks.filter((lorebook) => {
      const matchesSearch =
        query.length === 0 ||
        lorebook.lorebookName.toLowerCase().includes(query) ||
        lorebook.description.toLowerCase().includes(query) ||
        lorebook.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        lorebook.entries.some(
          (entry) =>
            entry.keywords.toLowerCase().includes(query) || entry.context.toLowerCase().includes(query)
        )

      const matchesVisibility =
        visibilityFilter === "all" ? true : lorebook.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" ? true : lorebook.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [lorebooks, safetyFilter, search, visibilityFilter])

  function handleEdit(lorebookId: string) {
    router.push(`/dashboard/creator/workspace/lorebooks/edit?edit=${lorebookId}`)
  }

  async function handleShare(lorebookId: string) {
    const shareUrl = `${window.location.origin}/dashboard/creator/workspace/lorebooks?lorebook=${lorebookId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Lorebook link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  function handleDelete(lorebookId: string) {
    const target = lorebooks.find((lorebook) => lorebook.id === lorebookId) ?? null
    setPendingDeleteLorebook(target)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteLorebook() {
    if (!pendingDeleteLorebook) return
    const lorebookId = pendingDeleteLorebook.id
    const response = await fetch(`/api/creator/lorebooks?id=${lorebookId}`, { method: "DELETE" })
    const payload = (await response.json()) as { error?: string; details?: string }
    if (!response.ok) {
      toast.error("Unable to delete lorebook", {
        description: payload.details ?? payload.error ?? "Please try again.",
      })
      return
    }
    setLorebooks((current) => current.filter((lorebook) => lorebook.id !== lorebookId))
    toast.success("Lorebook deleted")
    setDeleteDialogOpen(false)
    setPendingDeleteLorebook(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace · Lorebooks
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Build reusable lorebook assets with multiple keyword-context entries.
            </p>
          </div>
          <Link
            href="/dashboard/creator/workspace/lorebooks/new"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus className="size-4" />
            New Lorebook
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Lorebook Library</CardTitle>
          <CardDescription>Search and filter lorebooks used for creator world consistency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, tag, keyword or context"
                className="pl-8"
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={(value) => setVisibilityFilter(value as "all" | LorebookVisibility)}
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
              onValueChange={(value) => setSafetyFilter(value as "all" | LorebookSafety)}
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
              Showing <span className="font-medium text-foreground">{filteredLorebooks.length}</span> lorebooks
            </span>
            <Badge variant="outline">{lorebooks.length} total</Badge>
          </div> */}

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Loading lorebooks...</p>
            </div>
          ) : filteredLorebooks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No lorebooks found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new lorebook.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredLorebooks.map((lorebook) => (
                <LorebookCard
                  key={lorebook.id}
                  lorebook={lorebook}
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
            <DialogTitle>Delete lorebook?</DialogTitle>
            <DialogDescription>
              {pendingDeleteLorebook
                ? `This will permanently remove "${pendingDeleteLorebook.lorebookName}".`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPendingDeleteLorebook(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteLorebook}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
