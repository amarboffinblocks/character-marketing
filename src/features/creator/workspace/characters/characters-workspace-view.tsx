"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CharacterCard } from "@/features/creator/workspace/characters/character-card"
import {
  CharacterSafety,
  CharacterVisibility,
  creatorCharacters,
} from "@/features/creator/workspace/characters/characters-data"
import { cn } from "@/lib/utils"

export function CharactersWorkspaceView() {
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | CharacterVisibility>("all")
  const [safetyFilter, setSafetyFilter] = useState<"all" | CharacterSafety>("all")

  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase()

    return creatorCharacters.filter((character) => {
      const matchesSearch =
        query.length === 0 ||
        character.characterName.toLowerCase().includes(query) ||
        character.description.toLowerCase().includes(query) ||
        character.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesVisibility =
        visibilityFilter === "all" ? true : character.visibility === visibilityFilter
      const matchesSafety = safetyFilter === "all" ? true : character.safety === safetyFilter

      return matchesSearch && matchesVisibility && matchesSafety
    })
  }, [safetyFilter, search, visibilityFilter])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace · Characters
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Build and manage reusable character cards for faster creator delivery.
            </p>
          </div>
          <Link
            href="/dashboard/creator/workspace/characters/new"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus className="size-4" />
            New Character
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Character Library</CardTitle>
          <CardDescription>
            Premium creator cards inspired by your reference layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, tag, or style"
                className="pl-8"
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={(value) =>
                setVisibilityFilter(value as "all" | CharacterVisibility)
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
              onValueChange={(value) => setSafetyFilter(value as "all" | CharacterSafety)}
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

          {filteredCharacters.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No characters found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or create a new character.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredCharacters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
