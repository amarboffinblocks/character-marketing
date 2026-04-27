"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
import { PersonaCard } from "@/features/creator/workspace/personas/persona-card"
import {
  CreatorPersona,
  PersonaSafety,
  PersonaVisibility,
} from "@/features/creator/workspace/personas/personas-data"
import { cn } from "@/lib/utils"

export function PersonasWorkspaceView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | PersonaVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | PersonaSafety>("all")
  const [personas, setPersonas] = useState<CreatorPersona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeletePersona, setPendingDeletePersona] = useState<CreatorPersona | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadPersonas() {
      try {
        const response = await fetch("/api/creator/personas")
        if (!response.ok) return
        const payload = (await response.json()) as { items?: CreatorPersona[] }
        if (!mounted) return
        setPersonas(payload.items ?? [])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadPersonas()
    return () => {
      mounted = false
    }
  }, [])

  const filteredPersonas = useMemo(() => {
    const query = search.trim().toLowerCase()
    return personas.filter((persona) => {
      const matchesSearch =
        query.length === 0 ||
        persona.personaName.toLowerCase().includes(query) ||
        persona.personaDetails.toLowerCase().includes(query) ||
        persona.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesVisibility =
        visibilityFilter === "all" ? true : persona.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" ? true : persona.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [personas, safetyFilter, search, visibilityFilter])

  function handleEdit(personaId: string) {
    router.push(`/dashboard/creator/workspace/personas/edit?edit=${personaId}`)
  }

  async function handleShare(personaId: string) {
    const shareUrl = `${window.location.origin}/share/personas/${personaId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Persona link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  function handleDelete(personaId: string) {
    const target = personas.find((persona) => persona.id === personaId) ?? null
    setPendingDeletePersona(target)
    setDeleteDialogOpen(true)
  }

  async function confirmDeletePersona() {
    if (!pendingDeletePersona) return
    const personaId = pendingDeletePersona.id
    const response = await fetch(`/api/creator/personas?id=${personaId}`, { method: "DELETE" })
    const payload = (await response.json()) as { error?: string; details?: string }
    if (!response.ok) {
      toast.error("Unable to delete persona", {
        description: payload.details ?? payload.error ?? "Please try again.",
      })
      return
    }
    setPersonas((current) => current.filter((persona) => persona.id !== personaId))
    toast.success("Persona deleted")
    setDeleteDialogOpen(false)
    setPendingDeletePersona(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace · Personas
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Build reusable persona voice packs for your marketplace listings.
            </p>
          </div>
          <Link
            href="/dashboard/creator/workspace/personas/new"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus className="size-4" />
            New Persona
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Persona Library</CardTitle>
          <CardDescription>Search and filter persona assets used in creator orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by persona name, tags, details"
                className="pl-8"
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={(value) => setVisibilityFilter(value as "all" | PersonaVisibility)}
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
              onValueChange={(value) => setSafetyFilter(value as "all" | PersonaSafety)}
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
              Showing <span className="font-medium text-foreground">{filteredPersonas.length}</span> personas
            </span>
            <Badge variant="outline">{personas.length} total</Badge>
          </div> */}

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Loading personas...</p>
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No personas found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new persona.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
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
            <DialogTitle>Delete persona?</DialogTitle>
            <DialogDescription>
              {pendingDeletePersona
                ? `This will permanently remove "${pendingDeletePersona.personaName}".`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPendingDeletePersona(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeletePersona}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
