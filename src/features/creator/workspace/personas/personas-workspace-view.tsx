"use client"

import { FormEvent, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PersonaCard } from "@/features/creator/workspace/personas/persona-card"
import {
  CreatorPersona,
  creatorPersonas,
  PersonaSafety,
  PersonaVisibility,
} from "@/features/creator/workspace/personas/personas-data"

type PersonaFormState = {
  personaName: string
  avatarUrl: string
  tags: string
  safety: PersonaSafety
  visibility: PersonaVisibility
  personaDetails: string
}

const defaultPersonaForm: PersonaFormState = {
  personaName: "",
  avatarUrl: "",
  tags: "",
  safety: "SFW",
  visibility: "public",
  personaDetails: "",
}

export function PersonasWorkspaceView() {
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | PersonaVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | PersonaSafety>("all")
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [personas, setPersonas] = useState<CreatorPersona[]>(creatorPersonas)
  const [form, setForm] = useState<PersonaFormState>(defaultPersonaForm)

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

  function handleCreatePersona(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.personaName.trim() || !form.personaDetails.trim()) return

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const newPersona: CreatorPersona = {
      id: `persona-${crypto.randomUUID()}`,
      personaName: form.personaName.trim(),
      avatarUrl: form.avatarUrl.trim(),
      tags,
      safety: form.safety,
      visibility: form.visibility,
      personaDetails: form.personaDetails.trim(),
      updatedAt: "just now",
      usageCount: 0,
    }

    setPersonas((current) => [newPersona, ...current])
    setForm(defaultPersonaForm)
    setOpenCreateDialog(false)
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
              Manage reusable persona voice packs and open the create form in dialog.
            </p>
          </div>

          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger render={<Button className="h-9" />}>
              <Plus className="size-4" />
              New Persona
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Persona</DialogTitle>
                <DialogDescription>
                  Fill persona name, avatar, tags, safety, visibility, and persona details.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleCreatePersona}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Persona Name</p>
                    <Input
                      value={form.personaName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, personaName: event.target.value }))
                      }
                      placeholder="Ex: Royal Advisor"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Avatar URL</p>
                    <Input
                      value={form.avatarUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Tags</p>
                  <Input
                    value={form.tags}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, tags: event.target.value }))
                    }
                    placeholder="Romance, Advisor, Strategic"
                  />
                  <p className="text-xs text-muted-foreground">Use comma separated tags.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Safety</p>
                    <Select
                      value={form.safety}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, safety: value as PersonaSafety }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select safety" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SFW">SFW</SelectItem>
                        <SelectItem value="NSFW">NSFW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Visibility</p>
                    <Select
                      value={form.visibility}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, visibility: value as PersonaVisibility }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Persona Details</p>
                  <Textarea
                    value={form.personaDetails}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, personaDetails: event.target.value }))
                    }
                    placeholder="Describe tone, behavior style, and speaking pattern..."
                    className="min-h-28"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Persona</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-medium text-foreground">{filteredPersonas.length}</span> personas
            </span>
            <Badge variant="outline">{personas.length} total</Badge>
          </div>

          {filteredPersonas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No personas found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new persona.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredPersonas.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
